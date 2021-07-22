"use strict";
export class VnetIntegrationConfigChecker {
    constructor(siteInfo, diagProvider, apiVersion = "2021-01-01") {
        if (siteInfo == null || diagProvider == null) {
            throw new error("Constructor parameters cannot be null");
        }
        this.siteInfo = siteInfo;
        this.diagProvider = diagProvider;
        this.apiVersion = apiVersion;

        this.siteArmId = siteInfo.id;
        this.serverFarmId = siteInfo.serverFarmId;
        this.dataPreparePromise = this.prepareDataAsync();
    }

    async prepareDataAsync() {
        this.siteVnetInfo = await this.getWebAppVnetInfoAsync();

    }

    async getVnetIntegrationTypeAsync() {
        //swift, gateway, none or null
        await this.dataPreparePromise;
        var siteVnetInfo = this.siteVnetInfo;
        if (siteVnetInfo != null && siteVnetInfo["properties"] != null) {
            var vnetInfo = siteVnetInfo["properties"];

            //We fetch Subnet resource Id here to validate if app is using regional Vnet integration
            //If subnetResourceId is null, it means Regional Vnet integration is not configured for the app
            var subnetResourceId = vnetInfo["subnetResourceId"];
            if (subnetResourceId != null) {
                return "swift";
            } else {
                var siteGWVnetInfo = await this.getGatewayVnetInfoAsync();
                if (siteGWVnetInfo != null && siteGWVnetInfo.length > 0) {
                    this.siteGWVnetInfo = siteGWVnetInfo;
                    return "gateway";
                } else {
                    return "none";
                }
            }
        } else {
            return null;
        }
    }

    async getVNetInfoPropertyAsync(property){
        await this.dataPreparePromise;
        var siteVnetInfo = this.siteVnetInfo;
        if (siteVnetInfo != null && siteVnetInfo["properties"] != null) {
            var vnetInfo = siteVnetInfo["properties"];
            var value = vnetInfo[property];
            return value;
        } else {
            return null;
        }
    }

    async getSwiftSubnetIdAsync() {
        var subnetResourceId = await this.getVNetInfoPropertyAsync("subnetResourceId");
        return subnetResourceId;
    }

    async isSwiftSupportedAsync(){
        var swiftSupported = await this.getVNetInfoPropertyAsync("swiftSupported");
        return swiftSupported;
    }
    

    isSubnetResourceIdFormatValid(subnetResourceId) {
        if (subnetResourceId != null && subnetResourceId.includes("/subnets/")) {
            return true;
        }
        return false;
    }

    async getGatewayVnetInfoAsync() {
        var siteGWVnetInfo = await this.diagProvider.getArmResourceAsync(this.siteArmId + "/virtualNetworkConnections", this.apiVersion);
        return siteGWVnetInfo;
    }

    subnetSalExists(subnetData){
        var subnetProperties = subnetData["properties"];
        return subnetProperties["serviceAssociationLinks"] != null && subnetProperties["serviceAssociationLinks"].length > 0;
    }

    isSubnetSalOwnerCorrect(subnetData, aspId){
        if(this.subnetSalExists(subnetData)){
            var sal =  subnetData["properties"]["serviceAssociationLinks"];
            var linkedAsp = sal[0]["properties"]["link"];
            return linkedAsp.toLowerCase() == aspId.toLowerCase();
        }else{
            return false;
        }
    }

    isSubnetDelegated(subnetData){
        var subnetProperties = subnetData["properties"];
        var subnetDelegation = subnetProperties["delegations"];
        if(subnetDelegation && subnetDelegation.length > 0 && subnetDelegation[0]["properties"]["serviceName"].toLowerCase() == ("Microsoft.Web/serverFarms").toLowerCase()){
            return true;
        }else{
            return false;
        }
    }

    async getAspConnectedSubnetsAsync(aspSitesData, limit = 1){
        var aspSites = aspSitesData["value"];
        var subnets = new Set();
        if (aspSites != null) {
            for (var i = 0; i < aspSites.length; i++) {
                if (aspSites[i] && aspSites[i]["id"] == null) {
                    continue;
                }
                var siteResourceUri = aspSites[i]["id"];
                var siteVnetInfo = await this.diagProvider.getArmResourceAsync(siteResourceUri + "/config/virtualNetwork", this.apiVersion);
    
                if (siteVnetInfo["properties"] != null && siteVnetInfo["properties"]["subnetResourceId"] != null) {
                    var subnetResourceId = siteVnetInfo["properties"]["subnetResourceId"];
                    subnets.add(subnetResourceId);
                }
            }
        }

        return subnets.values();
    }

    async getInstancesPrivateIpAsync(instanceData){
        var instances = instanceData.value;
        var privateIpPromiseArray = [];
        for (var i = 0; i < instances.length; i++) {
            if (instances[i] && instances[i]["name"] == null) {
                return null;
            }
            var instanceName = instances[i]["name"];
            var privateIpPromise = this.diagProvider.getEnvironmentVariablesAsync(["WEBSITE_PRIVATE_IP"], instanceName);
            privateIpPromiseArray.push(privateIpPromise);
        }
        try{
            var ips = await Promise.all(privateIpPromiseArray);
            return ips;
        }catch(e){
            this.diagProvider.logException(e, "getInstancesPrivateIpAsync");
            return null;
        }

    }

    async getWebAppVnetInfoAsync() {
        //This is the regional VNet Integration endpoint
        var swiftUrl = this.siteArmId + "/config/virtualNetwork";
        var siteVnetInfo = await this.diagProvider.getArmResourceAsync(swiftUrl, this.apiVersion);

        return siteVnetInfo;
    }
}