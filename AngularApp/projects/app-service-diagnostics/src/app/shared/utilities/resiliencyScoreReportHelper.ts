import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { ResiliencyReportData, ResiliencyResource, ResiliencyFeature } from "./resiliencyReportData"
import { DataTableResponseObject } from '../../../../../diagnostic-data/src/lib/models/detector';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

export class ResiliencyScoreReportHelper {

    static generateResiliencyReport(table: DataTableResponseObject) {

        const customerNameRow = 0;
        const resiliencyResourceListRow = 1;
        const resiliencyFeaturesListRow = 2;
        let customerName: string;
        //this.keyDataMapping = new Map<string, DiagnosticData[]>();


        customerName = JSON.parse(table.rows[0][customerNameRow]).CustomerName;
        let resiliencyResourceList: ResiliencyResource[] = JSON.parse(table.rows[resiliencyResourceListRow][0]);

        let i = 0;
        for (let j: number = resiliencyFeaturesListRow; j < (resiliencyFeaturesListRow + resiliencyResourceList.length); j++) {
            let resiliencyFeaturesList: ResiliencyFeature[];
            resiliencyFeaturesList = JSON.parse(table.rows[j][0]);
            resiliencyResourceList[i].ResiliencyFeaturesList = resiliencyFeaturesList;
            i++;
        }
        let resiliencyReportData = new ResiliencyReportData(customerName, resiliencyResourceList);
        ResiliencyScoreReportHelper.PDFMake(resiliencyReportData);
    }



    //
    // Calculates the background color for the Score
    // 80 to 100 = Green
    // 60 to 80  = Yellow
    //  0 to 60  = Red
    //
    static ScoreColor(score: number) {
        if (arguments[0] < 60) {
            return '#f50f2f'; //red
            console.log('Red color');
        } else if (arguments[0] < 80) {
            return '#f5d00f'; //yellow
            console.log('yellow color');
        } else if (arguments[0] < 100) {
            return '#06a11a'; //green
            console.log('green color');
        } else {
            return 'white'; //if undefined or more than 100 set to white
            console.log('white color');
        }
    }

    //
    // receives a JSON table and returns an array
    //
    static JSONtoArray(jsonObject: any) {


        // let resiliencyReportData = new ResiliencyReportData("H&R Block");
        // console.log("Customer Name: ", resiliencyReportData.customerName);

        // for (let element in jsonObject) {
        //     if ()
        // }
        // let resiliencyFeature = new ResiliencyFeature();
        // resiliencyFeature.name = "Health check";
        // resiliencyFeature.featureWeight = 
        // resiliencyFeature.
        // let resiliencyResource = new ResiliencyResource();
        // resiliencyResource.name = "SiteName1";
        // resiliencyResource.overallScore = 50;



        // let resiliencyResourceList = new ResiliencyResource[3];
        // resiliencyResourceList[0].name = "SiteName1";
        // resiliencyResourceList[1].name = "SiteName2";
        // resiliencyResourceList[2].name = "SiteName3";    
        // resiliencyReportData.resiliencyResourceList = resiliencyResourceList;    
        // console.log("Site1: ", resiliencyReportData.resiliencyResourceList[0].Name);
        // resiliencyReportData.resiliencyResourceList[0].resiliencyFeaturesList[0].name = "Health Check";
        // console.log("Site1: ", resiliencyReportData.resiliencyResourceList[0].resiliencyFeaturesList[0].name);
        //  outputArray = [];
        // for (let element in jsonObject) {
        //     outputArray.push({
        //         resiliencyReport: element
        //     })
        // } 


    }

    //
    // Provides the Fully implemented, Partially implemented and Not implemented icons based on the Feature result
    // 0 = Not Implemented
    // 1 = Partially Implemented
    // 2 or any other = Fully Implemented
    //
    static ImplementedImage(featureScore) {
        if (arguments[0] == 0) {
            console.log('Not Implemented: ', arguments[0]);
            return 'data:image/png;base64,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';
        } else if (arguments[0] == 1) {
            console.log('Partially Implemented: ', arguments[0]);
            return 'data:image/png;base64,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';
        } else {
            console.log('Fully Implemented: ', arguments[0]);
            return 'data:image/png;base64,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';
        }
    }
    //
    // Provides passing grade per score
    // 0 = Fail
    // 1 = N/A
    // 2 or any other = Pass
    //
    static ScoreGrade(featureScore) {
        if (arguments[0] == 0) {
            console.log('Fail: ', arguments[0]);
            return 'Fail';
        } else if (arguments[0] == 1) {
            console.log('N/A: ', arguments[0]);
            return 'N/A';
        } else {
            console.log('Pass: ', arguments[0]);
            return 'Pass';
        }
    }

    //
    // Calculates the font color for the grade
    // 2 = Green
    // 1  = Yellow
    // 0  = Red
    //
    static GradeColor(score) {
        if (arguments[0] == 0) {
            return '#f50f2f'; //red
            console.log('Red color');
        } else if (arguments[0] == 1) {
            return '#f5d00f'; //yellow
            console.log('yellow color');
        } else
            return '#538135'; //green
        console.log('green color');
    }


    // Creating Resiliency status per feature table

    static ResiliencyStatusPerFeatureTable(resiliencyReportData: ResiliencyReportData) {
        let headers = `[{ text: 'Feature/Site name', style: 'rspfTableheader', margin: [0, 10] }, { text: '${resiliencyReportData.ResiliencyResourceList[0].Name}', style: 'rspfTableheader', margin: [0, 10] }, `;
        //`{ text: ${resiliencyReportData.ResiliencyResourceList[1].Name}, style: 'rspfTableheader', margin: [0, 10] }, { text: ${resiliencyReportData.ResiliencyResourceList[2].Name}, style: 'rspfTableheader', margin: [0, 10] }],`         
        let resiliencyStatusPerFeatureTable: string = "";

        //Generating headers
        for (let i: number = 1; i < resiliencyReportData.ResiliencyResourceList.length; i++) {
            headers = `${headers}{ text: '${resiliencyReportData.ResiliencyResourceList[i].Name}', style: 'rspfTableheader', margin: [0, 10] }`;
            if (i + 1 < resiliencyReportData.ResiliencyResourceList.length) {
                headers = `${headers},`
            }
            else {
                headers = `${headers}],`
            }
        };

        //Adding rows for each feature
        let rows = "";
        for (let i: number = 0; i < resiliencyReportData.ResiliencyResourceList[0].ResiliencyFeaturesList.length; i++) {
            rows = `${rows}[{ text: '${resiliencyReportData.ResiliencyResourceList[0].ResiliencyFeaturesList[i].Name}', style: 'rspfTableheader', }, `;
            for (let j: number = 0; j < resiliencyReportData.ResiliencyResourceList.length; j++) {
                rows = `${rows}{ margin: [50, 2], image: ${ResiliencyScoreReportHelper.ImplementedImage(resiliencyReportData.ResiliencyResourceList[j].ResiliencyFeaturesList[i].ImplementationGrade)}, fit: [20, 20] }`;
                if (j + 1 < resiliencyReportData.ResiliencyResourceList.length) {
                    rows = `${rows},`
                }
                else {
                    rows = `${rows}],`
                }
            }
        }
        let finalStr = `${headers}${rows}`;
        return finalStr.replace(/^"|"$/g, '');
    }

    // Prints date and time in which the report was generated
    static generatedOn(){
        let d = new Date();
        return d.toISOString();
    }

    static PDFMake(resiliencyReportData: ResiliencyReportData) {
        console.log(resiliencyReportData.CustomerName);
        console.log('Sitename1: ', resiliencyReportData.ResiliencyResourceList[0].Name, 'SiteScore1: ', resiliencyReportData.ResiliencyResourceList[0].OverallScore);
        //console.log('Sitename2: ', resiliencyReportData.ResiliencyResourceList[1].Name, 'SiteScore2: ', resiliencyReportData.ResiliencyResourceList[1].OverallScore);
        //console.log('Sitename3: ', resiliencyReportData.ResiliencyResourceList[2].Name, 'SiteScore3: ', resiliencyReportData.ResiliencyResourceList[2].OverallScore);
        pdfMake.fonts = {
            Roboto: {
                normal: 'Roboto-Regular.ttf',
                bold: 'Roboto-Medium.ttf',
                italics: 'Roboto-Italic.ttf',
                bolditalics: 'Roboto-Italic.ttf'
            },
            Calibri: {
                normal: 'Calibri-Light.ttf',
                bold: 'Calibri-Bold.ttf',
                italics: 'Calibri-Italic.ttf',
                bolditalics: 'Calibri-Bold-Italic.ttf',
                light: 'Calibri-Light.ttf',
                lightitalics: 'Calibri-Light-Italic.ttf'
            }
        };
        resiliencyReportData.ResiliencyResourceList[0].Name
        var docDefinition = {
            footer: function(currentPage, pageCount, pageSize) {
                 return [
                     { text: `${currentPage.toString()} of ${pageCount}`, alignment: 'center', fontsize: 6 },
                     { text: `Report generated on: ${ResiliencyScoreReportHelper.generatedOn()}`, alignment: 'right', fontSize: 6, margin: 15   },
                     { canvas: [ { type: 'rect', x: 170, y: 32, w: pageSize.width - 170, h: 40 } ] }
                    ]
                },
            pageSize: 'LETTER',
            pageOrientation: 'portrait',
            pageMargins: 60,
            content: [
                //Cover
                '\n\n\n\n\n',
                {
                    alignment: 'justify',
                    columns: [
                        {
                            alignment: 'right',
                            image: 'data:image/png;base64,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jzNREEAAAQQQQAABBBAwFSAhN2VhIwIIIIAAAggggAACegRIyPU4EwUBBBBAAAEEEEAAAVMBEnJTFjYigAACCCCAAAIIIKBHgIRcjzNREEAAAQQQQAABBBAwFSAhN2VhIwIIIIAAAggggAACegRIyPU4EwUBBBBAAAEEEEAAAVMBEnJTFjYigAACCCCAAAIIIKBHgIRcjzNREEAAAQQQQAABBBAwFSAhN2VhIwIIIIAAAggggAACegRIyPU4EwUBBBBAAAEEEEAAAVMBEnJTFjYigAACCCCAAAIIIKBHgIRcjzNREEAAAQQQQAABBBAwFSAhN2VhIwIIIIAAAggggAACegRIyPU4EwUBBBBAAAEEEEAAAVMBEnJTFjYigAACCCCAAAIIIKBHgIRcjzNREEAAAQQQQAABBBAwFSAhN2VhIwIIIIAAAggggAACegRIyPU4EwUBBBBAAAEEEEAAAVMBEnJTFjYigAACCCCAAAIIIKBHgIRcjzNREEAAAQQQQAABBBAwFSAhN2VhIwIIIIAAAggggAACegRIyPU4EwUBBBBAAAEEEEAAAVMBEnJTFjYigAACCCCAAAIIIKBHgIRcjzNREEAAAQQQQAABBBAwFSAhN2VhIwIIIIAAAggggAACegRIyPU4EwUBBBBAAAEEEEAAAVMBEnJTFjYigAACCCCAAAIIIKBHgIRcjzNREEAAAQQQQAABBBAwFSAhN2VhIwIIIIAAAggggAACegRIyPU4EwUBBBBAAAEEEEAAAVMBEnJTFjYigAACCCCAAAIIIKBHgIRcjzNREEAAAQQQQAABBBAwFSAhN2VhIwIIIIAAAggggAACegRIyPU4EwUBBBBAAAEEEEAAAVMBEnJTFjYigAACCCCAAAIIIKBHgIRcjzNREEAAAQQQQAABBBAwFSAhN2VhIwIIIIAAAggggAACegRIyPU4EwUBBBBAAAEEEEAAAVMBEnJTFjYigAACCCCAAAIIIKBHgIRcjzNREEAAAQQQQAABBBAwFSAhN2VhIwIIIIAAAggggAACegRIyPU4EwUBBBBAAAEEEEAAAVMBEnJTFjYigAACCCCAAAIIIKBHgIRcjzNREEAAAQQQQAABBBAwFSAhN2VhIwIIIIAAAggggAACegRIyPU4EwUBBBBAAAEEEEAAAVMBEnJTFjYigAACCCCAAAIIIKBHgIRcjzNREEAAAQQQQAABBBAwFSAhN2VhIwIIIIAAAggggAACegRIyPU4EwUBBBBAAAEEEEAAAVMBEnJTFjYigAACCCCAAAIIIKBHgIRcjzNREEAAAQQQQAABBBAwFSAhN2VhIwIIIIAAAggggAACegRIyPU4EwUBBBBAAAEEEEAAAVMBEnJTFjYigAACCCCAAAIIIKBHgIRcjzNREEAAAQQQQAABBBAwFSAhN2VhIwIIIIAAAggggAACegRIyPU4EwUBBBBAAAEEEEAAAVMBEnJTFjYigAACCCCAAAIIIKBHgIRcjzNREEAAAQQQQAABBIXrwB8AAAKaSURBVBAwFSAhN2VhIwIIIIAAAggggAACegRIyPU4EwUBBBBAAAEEEEAAAVMBEnJTFjYigAACCCCAAAIIIKBHgIRcjzNREEAAAQQQQAABBBAwFSAhN2VhIwIIIIAAAggggAACegRIyPU4EwUBBBBAAAEEEEAAAVMBEnJTFjYigAACCCCAAAIIIKBHgIRcjzNREEAAAQQQQAABBBAwFSAhN2VhIwIIIIAAAggggAACegRIyPU4EwUBBBBAAAEEEEAAAVMBEnJTFjYigAACCCCAAAIIIKBHgIRcjzNREEAAAQQQQAABBBAwFSAhN2VhIwIIIIAAAggggAACegRIyPU4EwUBBBBAAAEEEEAAAVMBEnJTFjYigAACCCCAAAIIIKBHgIRcjzNREEAAAQQQQAABBBAwFSAhN2VhIwIIIIAAAggggAACegRIyPU4EwUBBBBAAAEEEEAAAVMBEnJTFjYigAACCCCAAAIIIKBHgIRcjzNREEAAAQQQQAABBBAwFSAhN2VhIwIIIIAAAggggAACegRIyPU4EwUBBBBAAAEEEEAAAVMBEnJTFjYigAACCCCAAAIIIKBHgIRcjzNREEAAAQQQQAABBBAwFSAhN2VhIwIIIIAAAggggAACegRIyPU4EwUBBBBAAAEEEEAAAVMBEnJTFjYigAACCCCAAAIIIKBHgIRcjzNREEAAAQQQQAABBBAwFSAhN2VhIwIIIIAAAggggAACegRIyPU4EwUBBBBAAAEEEEAAAVMBEnJTFjYigAACCCCAAAIIIKBHgIRcjzNREEAAAQQQQAABBBAwFSAhN2VhIwIIIIAAAggggAACegRIyPU4EwUBBBBAAAEEEEAAAVMBEnJTFjYigAACCCCAAAIIIKBH4P8Dcbt4ifj4638AAAAASUVORK5CYII=',
                            width: 110,
                            height: 70
                        },
                        {
                            text: [
                                { text: '\n', font: 'Calibri', fontSize: 10 },
                                { text: '\nAzure App Service', style: 'header', alignment: 'center', width: '10' }
                            ]
                        },
                        {
                            text: '\n', style: 'header', alignment: 'center', width: '100'
                        }
                    ]
                },
                {
                    text: '\n\n'
                },
                {
                    alignment: 'center',
                    image: 'data:image/png;base64,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',
                    width: 250,
                    height: 250

                },
                {
                    text: '\n\n\n'
                },
                {
                    text: [
                        { text: 'Risk & Resiliency Assessment report\nPrepared for: ', style: 'title2', alignment: 'center' },
                        { text: resiliencyReportData.CustomerName, style: 'header', bold: true, alignment: 'center' }
                    ]
                },
                {
                    text: '\n\n\n\n',
                    pageOrientation: 'portrait',
                    pageBreak: 'after'
                },
                // Table of contents

                { text: '\n\n\n\n\n' },
                {
                    toc: {
                        id: 'mainToc',
                        title: { text: 'Table of Contents', style: 'header3' }
                    },
                },
                {
                    text: 'Azure App Service Resiliency score',
                    style: 'header3',
                    pageOrientation: 'portrait',
                    pageBreak: 'before',
                    tocItem: ['mainToc'],
                    tocStyle: { fontSize: 11 },
                    tocMargin: [0, 20, 0, 0],
                },
                '\n\n\n\n',
                {
                    columns: [
                        // Resiliency score table
                        {
                            text: '\n',
                            width: 140
                        },
                        {
                            alignment: 'center',                            
                            table: {
                               headerRows: 1,
                                widths: ['auto', 'auto'],
                                body: [
                                    [
                                        { text: 'Site name', style: 'apsrcTableheader' }, { text: 'Score', style: 'apsrcTableheader' }
                                    ],
                                    [
                                        { text: resiliencyReportData.ResiliencyResourceList[0].Name, style: 'apsrcTableevenrow' },
                                        { text: resiliencyReportData.ResiliencyResourceList[0].OverallScore, bold: true, fontSize: 18, fillColor: ResiliencyScoreReportHelper.ScoreColor(resiliencyReportData.ResiliencyResourceList[0].OverallScore) }
                                    ],                                   
                                ]
                            },
                            layout: {
                                hLineWidth: function (i, node) {
                                    return (i === 0 || i === node.table.body.length) ? 1 : 1;
                                },
                                vLineWidth: function (i, node) {
                                    return (i === 0 || i === node.table.widths.length) ? 1 : 1;
                                },
                                hLineColor: function (i, node) {
                                    return '#306cb8';
                                },
                                vLineColor: function (i, node) {
                                    return '#306cb8';
                                },
                            }
                        },
                    ],
                },
                {
                    alignment: 'justify',
                    text: '\n\n\n\n\n\n\nThis is a weighted calculation based on which best practices were followed.\n\nA score of 80 or above is considered highly resilient and it will be marked as green.\n\nA score of 100% doesn’t mean that the Web App will never be down but rather that it has implemented 100% of our resiliency best practices.\n',
                    fontSize: 11,
                },
                {
                    text: 'Resiliency status per feature',
                    style: 'header3',
                    pageOrientation: 'portrait',
                    pageBreak: 'before',
                    tocItem: ['mainToc'],
                    tocStyle: { fontSize: 11 },
                    tocMargin: [0, 5, 0, 0]
                },
                {
                    text: '\nDescription\n',
                    style: 'header4'
                },
                {
                    text: 'The following table shows the resiliency features verified and their status:\n\n',
                },
                {
                    columns: [
                        // Resiliency features table description
                        {
                            margin: [5, 2, 5, 2],
                            image: ResiliencyScoreReportHelper.ImplementedImage(2),
                            fit: [20, 20]
                        },
                        {
                            text: 'Fully implemented',
                            margin: [2, 2, 0, 2],
                            width: 140
                        },
                        {
                            margin: [5, 2, 5, 2],
                            image: ResiliencyScoreReportHelper.ImplementedImage(1),
                            fit: [20, 20]
                        },
                        {
                            text: 'Partially implemented',
                            margin: [2, 2, 0, 2],
                            width: 140
                        },
                        {
                            margin: [5, 2, 5, 2],
                            image: ResiliencyScoreReportHelper.ImplementedImage(0),
                            fit: [20, 20]
                        },
                        {
                            text: 'Not implemented',
                            margin: [2, 2, 0, 2],
                            width: 140
                        }
                    ]
                },
                {
                    text: '\n'
                },
                {
                    columns: [
                        // Resiliency score table
                        {
                            text: '\n',
                            width: 108
                        },
                        {
                            // Resiliency status per feature table
                            table: {
                                // headers are automatically repeated if the table spans over multiple pages
                                // you can declare how many rows should be treated as headers
                                headerRows: 1,
                                widths: [159, 109, 109, 109],
                                body: [
                                    [
                                        { text: 'Feature/Site name', style: 'rspfTableheader', margin: [0, 10] },
                                        { text: resiliencyReportData.ResiliencyResourceList[0].Name, style: 'rspfTableheader', margin: [0, 10] }
                                    ],
                                    [
                                        { text: resiliencyReportData.ResiliencyResourceList[0].ResiliencyFeaturesList[0].Name, style: 'rspfTableheader', },
                                        { margin: [50, 2], image: ResiliencyScoreReportHelper.ImplementedImage(resiliencyReportData.ResiliencyResourceList[0].ResiliencyFeaturesList[0].ImplementationGrade), fit: [20, 20] },
                                    ],
                                    [
                                        { text: resiliencyReportData.ResiliencyResourceList[0].ResiliencyFeaturesList[1].Name, style: 'rspfTableheader' },
                                        { margin: [50, 2], image: ResiliencyScoreReportHelper.ImplementedImage(resiliencyReportData.ResiliencyResourceList[0].ResiliencyFeaturesList[1].ImplementationGrade), fit: [20, 20] }
                                    ],
                                    [
                                        { text: resiliencyReportData.ResiliencyResourceList[0].ResiliencyFeaturesList[2].Name, style: 'rspfTableheader' },
                                        { margin: [50, 2], image: ResiliencyScoreReportHelper.ImplementedImage(resiliencyReportData.ResiliencyResourceList[0].ResiliencyFeaturesList[2].ImplementationGrade), fit: [20, 20] }
                                    ],
                                    [
                                        { text: resiliencyReportData.ResiliencyResourceList[0].ResiliencyFeaturesList[3].Name, style: 'rspfTableheader' },
                                        { margin: [50, 2], image: ResiliencyScoreReportHelper.ImplementedImage(resiliencyReportData.ResiliencyResourceList[0].ResiliencyFeaturesList[3].ImplementationGrade), fit: [20, 20] }
                                    ],
                                    [
                                        { text: resiliencyReportData.ResiliencyResourceList[0].ResiliencyFeaturesList[4].Name, style: 'rspfTableheader' },
                                        { margin: [50, 2], image: ResiliencyScoreReportHelper.ImplementedImage(resiliencyReportData.ResiliencyResourceList[0].ResiliencyFeaturesList[4].ImplementationGrade), fit: [20, 20] }
                                    ],
                                    [
                                        { text: resiliencyReportData.ResiliencyResourceList[0].ResiliencyFeaturesList[5].Name, style: 'rspfTableheader' },
                                        { margin: [50, 2], image: ResiliencyScoreReportHelper.ImplementedImage(resiliencyReportData.ResiliencyResourceList[0].ResiliencyFeaturesList[5].ImplementationGrade), fit: [20, 20] }
                                    ],
                                    [
                                        { text: resiliencyReportData.ResiliencyResourceList[0].ResiliencyFeaturesList[6].Name, style: 'rspfTableheader' },
                                        { margin: [50, 2], image: ResiliencyScoreReportHelper.ImplementedImage(resiliencyReportData.ResiliencyResourceList[0].ResiliencyFeaturesList[6].ImplementationGrade), fit: [20, 20] }
                                    ],
                                    [
                                        { text: resiliencyReportData.ResiliencyResourceList[0].ResiliencyFeaturesList[7].Name, style: 'rspfTableheader' },
                                        { margin: [50, 2], image: ResiliencyScoreReportHelper.ImplementedImage(resiliencyReportData.ResiliencyResourceList[0].ResiliencyFeaturesList[7].ImplementationGrade), fit: [20, 20] }
                                    ],
                                    [
                                        { text: resiliencyReportData.ResiliencyResourceList[0].ResiliencyFeaturesList[8].Name, style: 'rspfTableheader' },
                                        { margin: [50, 2], image: ResiliencyScoreReportHelper.ImplementedImage(resiliencyReportData.ResiliencyResourceList[0].ResiliencyFeaturesList[8].ImplementationGrade), fit: [20, 20] }
                                    ],
                                    [
                                        { text: resiliencyReportData.ResiliencyResourceList[0].ResiliencyFeaturesList[9].Name, style: 'rspfTableheader' },
                                        { margin: [50, 2], image: ResiliencyScoreReportHelper.ImplementedImage(resiliencyReportData.ResiliencyResourceList[0].ResiliencyFeaturesList[9].ImplementationGrade), fit: [20, 20] }
                                    ],
                                    [
                                        { text: resiliencyReportData.ResiliencyResourceList[0].ResiliencyFeaturesList[10].Name, style: 'rspfTableheader' },
                                        { margin: [50, 2], image: ResiliencyScoreReportHelper.ImplementedImage(resiliencyReportData.ResiliencyResourceList[0].ResiliencyFeaturesList[10].ImplementationGrade), fit: [20, 20] }
                                    ],
                                    [
                                        { text: resiliencyReportData.ResiliencyResourceList[0].ResiliencyFeaturesList[11].Name, style: 'rspfTableheader' },
                                        { margin: [50, 2], image: ResiliencyScoreReportHelper.ImplementedImage(resiliencyReportData.ResiliencyResourceList[0].ResiliencyFeaturesList[11].ImplementationGrade), fit: [20, 20] }
                                    ]
                                ],
                                layout: {
                                    hLineWidth: function (i, node) {
                                        return (i === 0 || i === node.table.body.length) ? 1 : 1;
                                    },
                                    vLineWidth: function (i, node) {
                                        return (i === 0 || i === node.table.widths.length) ? 1 : 1;
                                    },
                                    hLineColor: function (i, node) {
                                        return 'black';
                                    },
                                    vLineColor: function (i, node) {
                                        return 'black';
                                    }
                                }
                            }
                        }
                    ]
                },
                // Start of Use of multiple instances section
                {
                    text: 'Use of multiple instances',
                    style: 'header3',
                    pageOrientation: 'portrait',
                    pageBreak: 'before',
                    tocItem: ['mainToc'],
                    tocStyle: { fontSize: 11 },
                    tocMargin: [0, 5, 0, 0]
                },
                {
                    text: 'Description',
                    style: 'header4',
                    margin: [0, 5]
                },
                {
                    text: 'Running your app on only one VM instance is an immediate single point-of-failure. By ensuring that you have multiple instances allocated to your app, if something goes wrong with any instance, your app will still be able to respond to requests going to the other instances. Keep in mind that your app code should be able to handle multiple instances without synchronization issues when reading from or writing to data sources.',
                    style: 'paragraph',
                    alignment: 'justify'

                },
                {
                    text: 'Status of verified Web Apps',
                    style: 'header4',
                    margin: [0, 20]
                },
                {
                    margin: [0, 2],
                    alignment: 'center',
                    table: {
                        headerRows: 1,
                        widths: [109, 'auto', 329],
                        body: [
                            [
                                { text: 'Site name', style: 'detectTableheader' },
                                { text: 'Grade', style: 'detectTableheader' },
                                { text: 'Comments', style: 'detectTableheader' }
                            ],
                            [
                                { text: resiliencyReportData.ResiliencyResourceList[0].Name, style: 'detectTableevenrow', bold: true },
                                { text: ResiliencyScoreReportHelper.ScoreGrade(resiliencyReportData.ResiliencyResourceList[0].ResiliencyFeaturesList[0].ImplementationGrade), style: 'detectTableevenrow', bold:true, color: ResiliencyScoreReportHelper.GradeColor(resiliencyReportData.ResiliencyResourceList[0].ResiliencyFeaturesList[0].ImplementationGrade) },
                                { text: resiliencyReportData.ResiliencyResourceList[0].ResiliencyFeaturesList[0].GradeComments, style: 'detectTableevenrow', alignment: 'justify' }
                            ]]
                    },
                    layout: {
                        hLineWidth: function (i, node) {
                            return (i === 0 || i === node.table.body.length) ? 1 : 1;
                        },
                        vLineWidth: function (i, node) {
                            return (i === 0 || i === node.table.widths.length) ? 1 : 1;
                        },
                        hLineColor: function (i, node) {
                            return '#306cb8';
                        },
                        vLineColor: function (i, node) {
                            return '#306cb8';
                        },
                    }
                },
                {
                    text: 'Solution',
                    style: 'header4',
                    margin: [0, 20]
                },
                {
                    text: resiliencyReportData.ResiliencyResourceList[0].ResiliencyFeaturesList[0].SolutionComments,
                    style: 'paragraph',
                    alignment: 'justify'
                },
                {
                    text: 'To add more instances:\n',
                    style: 'paragraph',
                    alignment: 'justify'
                },
                {
                    style: 'paragraph',
                    ul: [
                        'Azure Portal:',
                        {
                            ul: [
                                { text: ['Open the ', { text: 'Azure Portal', bold: true }] },
                                { text: ['Click on ', { text: 'App Service plans', bold: true }] },
                                'Click on the App Service Plan hosting the Web App(s) you want to scale out.',
                                { text: ['Under ', { text: 'Settings ', bold: true }, 'click on ', { text: 'Scale out (App Service plan)', bold: true }] },
                                { text: ['Click ', { text: 'Manual scale', bold: true }] },
                                'Increase the number of instances to the desired value (at least 2)\n'
                            ]
                        },
                        'PowerShell:',
                        {
                            ul: [                                
                                { text: ['Use the ', { text: 'Set-AzAppServicePlan ', bold: true }, {text: 'command.\nFor more information see: '}, { text: "https://docs.microsoft.com/en-us/azure/app-service/scripts/powershell-scale-manual\n", color: 'blue', link: "https://docs.microsoft.com/en-us/azure/app-service/scripts/powershell-scale-manual", alignment: 'left' , decoration: 'underline'}] }, 
                            ],
                        },
                        'Azure CLI:',
                        {
                            ul: [                                
                                { text: ['Use the ', { text: 'az appservice plan update ', bold: true }, {text: 'command.\nFor more information see: '}, { text: "https://docs.microsoft.com/en-us/azure/app-service/scripts/cli-scale-manual\n", color: 'blue', link: "https://docs.microsoft.com/en-us/azure/app-service/scripts/cli-scale-manual", alignment: 'left' , decoration: 'underline'}] }                                
                            ]
                        },
                    ]
                },
                {
                    text: 'More information',
                    style: 'header4',
                    margin: [0, 20]
                },
                {
                    style: 'paragraph',
                    ul: [
                        { text: [ 'The Ultimate Guide to Running Healthy Apps in the Cloud - Use Multiple Instances\n', { text: "https://azure.github.io/AppService/2020/05/15/Robust-Apps-for-the-cloud.html#use-multiple-instances", color: 'blue', link: "https://azure.github.io/AppService/2020/05/15/Robust-Apps-for-the-cloud.html#use-multiple-instances", alignment: 'left' , decoration: 'underline'}] }                        
                    ]
                },
                // End of Use of multiple instances section
                // ------------------------------------------
                //start of Heal check section
                {
                    text: 'Health Check',
                    style: 'header3',
                    pageOrientation: 'portrait',
                    pageBreak: 'before',
                    tocItem: ['mainToc'],
                    tocStyle: { fontSize: 11 },
                    tocMargin: [0, 5, 0, 0]
                },
                {
                    text: 'Description',
                    style: 'header4',
                    margin: [0, 5]
                },
                {
                    text: 'App Service makes it easy to automatically scale your apps to multiple instances when traffic increases. This increases your app’s throughput, but what if there is an uncaught exception on one of the instances? App Service allows you to specify a health check path on your apps. The platform pings this path to determine if your application is healthy and responding to requests. If an instance fails to respond to the ping, the system determines it is unhealthy and removes it from the load balancer rotation. This increases your application’s average availability and resiliency. When your site is scaled out to multiple instances, App Service will exclude any unhealthy instance(s) from serving requests, improving your overall availability. Your app’s health check path should poll the critical components of your application, such as your database, cache, or messaging service and return a 5xx error if any of them fail. This ensures that the status returned by the health check path is an accurate picture of the overall health of your application.',
                    style: 'paragraph',
                    alignment: 'justify'

                },
                {
                    text: 'Status of verified Web Apps',
                    style: 'header4',
                    margin: [0, 20]
                },
                {
                    margin: [0, 2],
                    alignment: 'center',
                    table: {
                        headerRows: 1,
                        widths: [109, 'auto', 329],
                        body: [
                            [
                                { text: 'Site name', style: 'detectTableheader' },
                                { text: 'Grade', style: 'detectTableheader' },
                                { text: 'Comments', style: 'detectTableheader' }
                            ],
                            [
                                { text: resiliencyReportData.ResiliencyResourceList[0].Name, style: 'detectTableevenrow', bold: true },
                                { text: ResiliencyScoreReportHelper.ScoreGrade(resiliencyReportData.ResiliencyResourceList[0].ResiliencyFeaturesList[1].ImplementationGrade), style: 'detectTableevenrow', bold:true, color: ResiliencyScoreReportHelper.GradeColor(resiliencyReportData.ResiliencyResourceList[0].ResiliencyFeaturesList[1].ImplementationGrade) },
                                { text: resiliencyReportData.ResiliencyResourceList[0].ResiliencyFeaturesList[1].GradeComments, style: 'detectTableevenrow', alignment: 'justify' }
                            ]
                        ]
                    },
                    layout: {
                        hLineWidth: function (i, node) {
                            return (i === 0 || i === node.table.body.length) ? 1 : 1;
                        },
                        vLineWidth: function (i, node) {
                            return (i === 0 || i === node.table.widths.length) ? 1 : 1;
                        },
                        hLineColor: function (i, node) {
                            return '#306cb8';
                        },
                        vLineColor: function (i, node) {
                            return '#306cb8';
                        },
                    }
                },
                {
                    text: 'Solution',
                    style: 'header4',
                    margin: [0, 20]
                },
                {
                    text: resiliencyReportData.ResiliencyResourceList[0].ResiliencyFeaturesList[1].SolutionComments,
                    style: 'paragraph',
                    alignment: 'justify'
                },
                {
                    text: 'If you need to enable Health check on other Web App(s), follow these instructions:\n',
                    style: 'paragraph',
                    alignment: 'justify'
                },
                {
                    style: 'paragraph',
                    ul: [
                        { text: ['Using the ', { text: 'Azure Portal', bold: true }, ':'] },
                        {
                            ul: [
                                { text: ['Open the ', { text: 'Azure Portal', bold: true }] },
                                { text: ['Click on an ', { text: 'App Services', bold: true }] },
                                'Click on the Web App where for which you want to enable Health Check.',
                                { text: ['Under ', { text: 'Monitoring ', bold: true }, 'click in ', { text: 'Health check', bold: true }, '.'] },
                                { text: ['Click ', { text: 'Enable', bold: true }, '.'] },
                                { text: ['Under ', { text: 'Path ', bold: true }, 'add the path to a page that will only return 200 once your app and its dependencies are responsive.'] },
                                { text: ['Configure the time in ', { text: 'Load Balancing ', bold: true }, 'and click ', { text: 'Save', bold: true }, '.'] }
                            ]
                        },
                    ]
                },
                {
                    text: 'More information',
                    style: 'header4',
                    margin: [0, 20]
                },
                {
                    style: 'paragraph',
                    ul: [
                        { text: 'Health Check is now Generally Available\nhttps://azure.github.io/AppService/2020/08/24/healthcheck-on-app-service.htm', alignment: 'left' },
                        {text: 'The Ultimate Guide to Running Healthy Apps in the Cloud – Set your Health Check path\nhttps://azure.github.io/AppService/2020/05/15/Robust-Apps-for-the-cloud.html#set-your-health-check-path', alignment: 'left' } 
                    ],
                },
                // End of Health check section
                // ------------------------------------------
                // Start of Auto-Heal section
                {
                    text: 'Auto-Heal',
                    style: 'header3',
                    pageOrientation: 'portrait',
                    pageBreak: 'before',
                    tocItem: ['mainToc'],
                    tocStyle: { fontSize: 11 },
                    tocMargin: [0, 5, 0, 0]
                },
                {
                    text: 'Description',
                    style: 'header4',
                    margin: [0, 5]
                },
                {
                    text: 'Sometimes your app may run into issues, resulting in downtimes, slowness, or other unexpected behaviors. We’ve built App Service Diagnostics to help you diagnose and solve issues with your web app with recommended troubleshooting and next steps. However, these unexpected behaviors may be temporarily resolved with some simple mitigation steps, such as restarting the process or starting another executable, or require additional data collection, so that you can better troubleshoot the ongoing issue later. With Auto Healing, you can set up custom mitigation actions to run when certain conditions (that you define as unexpected or a sign of unhealthy behavior) are met:',
                    style: 'paragraph',
                    alignment: 'justify'

                },
                {
                    style: 'paragraph',
                    margin: 15,
                    ul: [
                        'Request Duration: examines slow requests',
                        'Memory Limit: examines process memory in private bytes',
                        'Request Count: examines number of requests',
                        'Status Codes: examines number of requests and their HTTP status code'
                    ]
                },
                {
                    text: 'Status of verified Web Apps',
                    style: 'header4',
                    margin: [0, 20]
                },
                {
                    margin: [0, 2],
                    alignment: 'center',
                    table: {
                        headerRows: 1,
                        widths: [109, 'auto', 329],
                        body: [
                            [
                                { text: 'Site name', style: 'detectTableheader' },
                                { text: 'Grade', style: 'detectTableheader' },
                                { text: 'Comments', style: 'detectTableheader' }
                            ],
                            [
                                { text: resiliencyReportData.ResiliencyResourceList[0].Name, style: 'detectTableevenrow', bold: true },
                                { text: ResiliencyScoreReportHelper.ScoreGrade(resiliencyReportData.ResiliencyResourceList[0].ResiliencyFeaturesList[2].ImplementationGrade), style: 'detectTableevenrow', bold:true, color: ResiliencyScoreReportHelper.GradeColor(resiliencyReportData.ResiliencyResourceList[0].ResiliencyFeaturesList[2].ImplementationGrade) },
                                { text: resiliencyReportData.ResiliencyResourceList[0].ResiliencyFeaturesList[2].GradeComments, style: 'detectTableevenrow', alignment: 'justify' }
                            ]
                        ]
                    },
                    layout: {
                        hLineWidth: function (i, node) {
                            return (i === 0 || i === node.table.body.length) ? 1 : 1;
                        },
                        vLineWidth: function (i, node) {
                            return (i === 0 || i === node.table.widths.length) ? 1 : 1;
                        },
                        hLineColor: function (i, node) {
                            return '#306cb8';
                        },
                        vLineColor: function (i, node) {
                            return '#306cb8';
                        },
                    }
                },
                {
                    text: 'Solution',
                    style: 'header4',
                    margin: [0, 20]
                },
                {
                    text: resiliencyReportData.ResiliencyResourceList[0].ResiliencyFeaturesList[2].SolutionComments,
                    style: 'paragraph',
                    alignment: 'justify'
                },
                {
                    style: 'paragraph',
                    ul: [
                        { text: ['To enable ', { text: 'Auto-Heal', bold: true }, ':'] },
                        {
                            ul: [
                                { text: ['Open the ', { text: 'Azure Portal', bold: true }] },
                                { text: ['Click on an ', { text: 'App Services', bold: true }] },
                                'Click on the Web App where for which you want to enable Auto-Heal',
                                { text: ['Click ', { text: 'Diagnose and solve problems ', bold: true }] },
                                { text: ['Type ', { text: 'Auto-Heal ', bold: true }, 'in the “Search for common problems or tools.” box and click in ', { text: 'Auto-Heal ', bold: true }, 'under the results'] },
                                'For custom rules:',
                                {
                                    ul: [
                                        { text: ['Under the ', { text: 'Custom Auto-Heal Rules ', bold: true }, 'tab set ', { text: 'Custom Auto-Heal Rules ', bold: true }, 'to ', { text: 'Enabled', bold: true }] }
                                    ]
                                },
                                'For Proactive  Auto-Heal',
                                {
                                    ul: [
                                        { text: ['Under the ', { text: 'Proactive Auto-Heal ', bold: true }, 'tab set ', { text: 'Proactive Auto-Heal ', bold: true }, 'to ', { text: 'Enabled', bold: true }] }
                                    ]
                                }
                            ]
                        },
                    ]
                },
                {
                    text: 'More information',
                    style: 'header4',
                    margin: [0, 20]
                },
                {
                    style: 'paragraph',
                    ul: [
                        { text: [ 'Announcing the New Auto Healing Experience in App Service Diagnostics\n', { text: "https://azure.github.io/AppService/2018/09/10/Announcing-the-New-Auto-Healing-Experience-in-App-Service-Diagnostics.html", color: 'blue', link: "https://azure.github.io/AppService/2018/09/10/Announcing-the-New-Auto-Healing-Experience-in-App-Service-Diagnostics.html", alignment: 'left' , decoration: 'underline'}] }
                    ]
                },
                // End of Auto-Heal section
                // ------------------------------------------
                // Start of Deploy in Multiple Regions/Zones section
                {
                    text: 'Deploy in Multiple Regions/Zones',
                    style: 'header3',
                    pageOrientation: 'portrait',
                    pageBreak: 'before',
                    tocItem: ['mainToc'],
                    tocStyle: { fontSize: 11 },
                    tocMargin: [0, 5, 0, 0]
                },
                {
                    text: 'Description',
                    style: 'header4',
                    margin: [0, 5]
                },
                {
                    text: 'You can deploy Azure Front Door or Azure Traffic Manager to intercept traffic before they hit your site. They help in routing & distributing traffic between your instances/regions. If a catastrophic incident happens in one of the Azure Datacenters, you can still guarantee that your app will run and serve requests by investing in one of them.\n There are additional benefits to using Front Door or Traffic Manager, such as routing incoming requests based the customers’ geography to provide the shortest respond time to customers and distribute the load among your instances in order not to overload one of them with requests.',
                    style: 'paragraph',
                    alignment: 'justify'

                },
                {
                    text: 'Status of verified Web Apps',
                    style: 'header4',
                    margin: [0, 20]
                },
                {
                    margin: [0, 2],
                    alignment: 'center',
                    table: {
                        headerRows: 1,
                        widths: [109, 'auto', 329],
                        body: [
                            [
                                { text: 'Site name', style: 'detectTableheader' },
                                { text: 'Grade', style: 'detectTableheader' },
                                { text: 'Comments', style: 'detectTableheader' }
                            ],
                            [
                                { text: resiliencyReportData.ResiliencyResourceList[0].Name, style: 'detectTableevenrow', bold: true },
                                { text: ResiliencyScoreReportHelper.ScoreGrade(resiliencyReportData.ResiliencyResourceList[0].ResiliencyFeaturesList[3].ImplementationGrade), style: 'detectTableevenrow', bold:true, color: ResiliencyScoreReportHelper.GradeColor(resiliencyReportData.ResiliencyResourceList[0].ResiliencyFeaturesList[3].ImplementationGrade) },
                                { text: resiliencyReportData.ResiliencyResourceList[0].ResiliencyFeaturesList[3].GradeComments, style: 'detectTableevenrow', alignment: 'justify' }
                            ]
                        ]
                    },
                    layout: {
                        hLineWidth: function (i, node) {
                            return (i === 0 || i === node.table.body.length) ? 1 : 1;
                        },
                        vLineWidth: function (i, node) {
                            return (i === 0 || i === node.table.widths.length) ? 1 : 1;
                        },
                        hLineColor: function (i, node) {
                            return '#306cb8';
                        },
                        vLineColor: function (i, node) {
                            return '#306cb8';
                        },
                    }
                },
                {
                    text: 'Solution',
                    style: 'header4',
                    margin: [0, 20]
                },
                {
                    text: resiliencyReportData.ResiliencyResourceList[0].ResiliencyFeaturesList[3].SolutionComments,
                    style: 'paragraph',
                    alignment: 'justify'
                },
                {
                    text: 'More information',
                    style: 'header4',
                    margin: [0, 20]
                },
                {
                    style: 'paragraph',
                    ul: [
                        { text: [ 'The Ultimate Guide to Running Healthy Apps in the Cloud - Deploy in Multiple Regions\n', { text: "https://azure.github.io/AppService/2020/05/15/Robust-Apps-for-the-cloud.html#deploy-in-multiple-regions", color: 'blue', link: "https://azure.github.io/AppService/2020/05/15/Robust-Apps-for-the-cloud.html#deploy-in-multiple-regions", alignment: 'left' , decoration: 'underline'}] },
                        { text: [ 'Controlling Azure App Service traffic with Azure Traffic Manager\n', { text: "https://docs.microsoft.com/en-us/azure/app-service/web-sites-traffic-manager", color: 'blue', link: "https://docs.microsoft.com/en-us/azure/app-service/web-sites-traffic-manager", alignment: 'left' , decoration: 'underline'}] },
                        { text: [ 'Quickstart: Create a Front Door for a highly available global web application\n', { text: "https://docs.microsoft.com/en-us/azure/frontdoor/quickstart-create-front-door", color: 'blue', link: "https://docs.microsoft.com/en-us/azure/frontdoor/quickstart-create-front-door", alignment: 'left' , decoration: 'underline'}] }                        
                    ],
                },
                // End of Deploy in Multiple Regions/Zones section
                // ------------------------------------------
                // Start of Regional Pairing section
                {
                    text: 'Regional Pairing',
                    style: 'header3',
                    pageOrientation: 'portrait',
                    pageBreak: 'before',
                    tocItem: ['mainToc'],
                    tocStyle: { fontSize: 11 },
                    tocMargin: [0, 5, 0, 0]
                },
                {
                    text: 'Description',
                    style: 'header4',
                    margin: [0, 5]
                },
                {
                    text: 'An Azure region consists of a set of data centers deployed within a latency-defined perimeter and connected through a dedicated low-latency network. This ensures that Azure services within an Azure region offer the best possible performance and security.\nAn Azure geography defines an area of the world containing at least one Azure region. Geographies define a discrete market, typically containing two or more regions, that preserve data residency and compliance boundaries.\nA regional pair consists of two regions within the same geography. Azure serializes platform updates (planned maintenance) across regional pairs, ensuring that only one region in each pair updates at a time. If an outage affects multiple regions, at least one region in each pair will be prioritized for recovery',
                    style: 'paragraph',
                    alignment: 'justify'

                },
                {
                    text: 'Status of verified Web Apps',
                    style: 'header4',
                    margin: [0, 20]
                },
                {
                    margin: [0, 2],
                    alignment: 'center',
                    table: {
                        headerRows: 1,
                        widths: [109, 'auto', 329],
                        body: [
                            [
                                { text: 'Site name', style: 'detectTableheader' },
                                { text: 'Grade', style: 'detectTableheader' },
                                { text: 'Comments', style: 'detectTableheader' }
                            ],
                            [
                                { text: resiliencyReportData.ResiliencyResourceList[0].Name, style: 'detectTableevenrow', bold: true },
                                { text: ResiliencyScoreReportHelper.ScoreGrade(resiliencyReportData.ResiliencyResourceList[0].ResiliencyFeaturesList[4].ImplementationGrade), style: 'detectTableevenrow', bold:true, color: ResiliencyScoreReportHelper.GradeColor(resiliencyReportData.ResiliencyResourceList[0].ResiliencyFeaturesList[4].ImplementationGrade) },
                                { text: resiliencyReportData.ResiliencyResourceList[0].ResiliencyFeaturesList[4].GradeComments, style: 'detectTableevenrow', alignment: 'justify' }
                            ]
                        ]
                    },
                    layout: {
                        hLineWidth: function (i, node) {
                            return (i === 0 || i === node.table.body.length) ? 1 : 1;
                        },
                        vLineWidth: function (i, node) {
                            return (i === 0 || i === node.table.widths.length) ? 1 : 1;
                        },
                        hLineColor: function (i, node) {
                            return '#306cb8';
                        },
                        vLineColor: function (i, node) {
                            return '#306cb8';
                        },
                    }
                },
                {
                    text: 'Solution',
                    style: 'header4',
                    margin: [0, 20]
                },
                {
                    text: resiliencyReportData.ResiliencyResourceList[0].ResiliencyFeaturesList[4].SolutionComments,
                    style: 'paragraph',
                    alignment: 'justify'
                },
                {
                    text: 'More information',
                    style: 'header4',
                    margin: [0, 20]
                },
                {
                    style: 'paragraph',
                    ol: [
                            { text: [ 'Business continuity and disaster recovery (BCDR): Azure Paired Regions\n', { text: "https://docs.microsoft.com/en-us/azure/best-practices-availability-paired-regions", color: 'blue', link: "https://docs.microsoft.com/en-us/azure/best-practices-availability-paired-regions", alignment: 'left' , decoration: 'underline'}] }
                    ]
                },
                // End of Regional Pairing section
                // ------------------------------------------
                // Start of Platform Upgrades Resiliency section
                {
                    text: 'Platform Upgrades Resiliency',
                    style: 'header3',
                    pageOrientation: 'portrait',
                    pageBreak: 'before',
                    tocItem: ['mainToc'],
                    tocStyle: { fontSize: 11 },
                    tocMargin: [0, 5, 0, 0]
                },
                {
                    text: 'Description',
                    style: 'header4',
                    margin: [0, 5]
                },
                {
                    text: 'Azure App Service platform upgrades take place regularly. When Azure App Service upgrades the instances that your application(s) are using, it will cause a restart of your Web App once the instance(s) hosting your application are upgraded.\nWe reviewed your Web App during the time of the most recent Platform upgrade while doing this report to see how it affected availability.',
                    style: 'paragraph',
                    alignment: 'justify'
                },
                {
                    text: 'Status of verified Web Apps',
                    style: 'header4',
                    margin: [0, 20]
                },
                {
                    margin: [0, 2],
                    alignment: 'center',
                    table: {
                        headerRows: 1,
                        widths: [109, 'auto', 329],
                        body: [
                            [
                                { text: 'Site name', style: 'detectTableheader' },
                                { text: 'Grade', style: 'detectTableheader' },
                                { text: 'Comments', style: 'detectTableheader' }
                            ],
                            [
                                { text: resiliencyReportData.ResiliencyResourceList[0].Name, style: 'detectTableevenrow', bold: true },
                                { text: ResiliencyScoreReportHelper.ScoreGrade(resiliencyReportData.ResiliencyResourceList[0].ResiliencyFeaturesList[5].ImplementationGrade), style: 'detectTableevenrow', bold:true, color: ResiliencyScoreReportHelper.GradeColor(resiliencyReportData.ResiliencyResourceList[0].ResiliencyFeaturesList[5].ImplementationGrade) },
                                { text: resiliencyReportData.ResiliencyResourceList[0].ResiliencyFeaturesList[5].GradeComments, style: 'detectTableevenrow', alignment: 'justify' }
                            ]
                        ]
                    },
                    layout: {
                        hLineWidth: function (i, node) {
                            return (i === 0 || i === node.table.body.length) ? 1 : 1;
                        },
                        vLineWidth: function (i, node) {
                            return (i === 0 || i === node.table.widths.length) ? 1 : 1;
                        },
                        hLineColor: function (i, node) {
                            return '#306cb8';
                        },
                        vLineColor: function (i, node) {
                            return '#306cb8';
                        },
                    }
                },
                {
                    text: 'Solution',
                    style: 'header4',
                    margin: [0, 20]
                },
                {
                    text: resiliencyReportData.ResiliencyResourceList[0].ResiliencyFeaturesList[5].SolutionComments,
                    style: 'paragraph',
                    alignment: 'justify'
                },
                {
                    text: 'More information',
                    style: 'header4',
                    margin: [0, 20]
                },
                {
                    style: 'paragraph',
                    ul: [
                        { text: [ 'Demystifying the magic behind App Service OS updates\n', { text: "https://azure.github.io/AppService/2018/01/18/Demystifying-the-magic-behind-App-Service-OS-updates.html", color: 'blue', link: "https://azure.github.io/AppService/2018/01/18/Demystifying-the-magic-behind-App-Service-OS-updates.html", alignment: 'left' , decoration: 'underline'}] }
                    ],
                },
                // End of Platform Upgrades Resiliency section
                // ------------------------------------------
                // Start of Automatically Redirecting Traffic During Platform Upgrades section
                {
                    text: 'Automatically Redirecting Traffic During Platform Upgrades',
                    style: 'header3',
                    pageOrientation: 'portrait',
                    pageBreak: 'before',
                    tocItem: ['mainToc'],
                    tocStyle: { fontSize: 11 },
                    tocMargin: [0, 5, 0, 0]
                },
                {
                    text: 'Description',
                    style: 'header4',
                    margin: [0, 5]
                },
                {
                    text: [
                        { text: ['You can register to receive notifications from the platform before the instances hosting your Azure App Service Web App running on App Service Environment (ASE) will be restarted due to a platform upgrade and again once the upgrade has finished.\nWith a combination of Azure Front Door and a Logic App, you can configure your environment so that traffic is automatically redirected to your Web App on another region while your Web App is going through a Platform Upgrade by following the steps on this document:\n', 
                        { text: "https://github.com/Azure-Samples/azure-logic-app-traffic-update-samples", color: 'blue', link: "https://github.com/Azure-Samples/azure-logic-app-traffic-update-samples", alignment: 'left' , decoration: 'underline'}, { text: '\nIMPORTANT: This opt-in feature is currently available only per request. Reach out to your CSAM to opt-in in this feature.', bold: true } ] }
                    ],
                    style: 'paragraph',
                    alignment: 'justify'

                },
                //End of Automatically Redirecting Traffic During Platform Upgrades section
                //------------------------------------------
                //Start of App density section
                {
                    text: 'App density',
                    style: 'header3',
                    pageOrientation: 'portrait',
                    pageBreak: 'before',
                    tocItem: ['mainToc'],
                    tocStyle: { fontSize: 11 },
                    tocMargin: [0, 5, 0, 0]
                },
                {
                    text: 'Description',
                    style: 'header4',
                    margin: [0, 5]
                },
                {
                    text: 'For production applications, it is recommended that an App Service Plan does not host more than a certain number of sites. The number may be lower depending on how resource intensive the hosted applications are, however as a general guidance, you may refer to the table below:',
                    style: 'paragraph',
                    alignment: 'justify'
                },
                {
                    margin: [170, 2],
                    alignment: 'center',
                    table: {
                        headerRows: 1,
                        widths: ['auto', 'auto'],
                        body: [
                            [
                                { text: 'Worker Size', style: 'maxSiteperWorkerSizeheader' }, { text: 'Max sites', style: 'maxSiteperWorkerSizeheader' }
                            ],
                            [
                                { text: 'Small', style: 'maxSiteperWorkerSizeevenRow', fillColor: 'gray' }, { text: '8', style: 'maxSiteperWorkerSizeevenrow' }
                            ],
                            [
                                { text: 'Medium', style: 'maxSiteperWorkerSizeoddRow' }, { text: '16', style: 'maxSiteperWorkerSizeoddrow' }
                            ],
                            [
                                { text: 'Large', style: 'maxSiteperWorkerSizeevenRow', fillColor: 'gray' }, { text: '32', style: 'maxSiteperWorkerSizeevenrow' }
                            ]
                        ]
                    },
                    layout: {
                        hLineWidth: function (i, node) {
                            return (i === 0 || i === node.table.body.length) ? 1 : 1;
                        },
                        vLineWidth: function (i, node) {
                            return (i === 0 || i === node.table.widths.length) ? 1 : 1;
                        },
                        hLineColor: function (i, node) {
                            return 'black';
                        },
                        vLineColor: function (i, node) {
                            return 'black';
                        },
                    }
                },
                {
                    text: 'Status of verified Web Apps',
                    style: 'header4',
                    margin: [0, 20]
                },
                {
                    margin: [0, 2],
                    alignment: 'center',
                    table: {
                        headerRows: 1,
                        widths: [109, 'auto', 329],
                        body: [
                            [
                                { text: 'Site name', style: 'detectTableheader' },
                                { text: 'Grade', style: 'detectTableheader' },
                                { text: 'Comments', style: 'detectTableheader' }
                            ],
                            [
                                { text: resiliencyReportData.ResiliencyResourceList[0].Name, style: 'detectTableevenrow', bold: true },
                                { text: ResiliencyScoreReportHelper.ScoreGrade(resiliencyReportData.ResiliencyResourceList[0].ResiliencyFeaturesList[6].ImplementationGrade), style: 'detectTableevenrow', bold:true, color: ResiliencyScoreReportHelper.GradeColor(resiliencyReportData.ResiliencyResourceList[0].ResiliencyFeaturesList[6].ImplementationGrade) },
                                { text: resiliencyReportData.ResiliencyResourceList[0].ResiliencyFeaturesList[6].GradeComments, style: 'detectTableevenrow', alignment: 'justify' }
                            ]
                        ]
                    },
                    layout: {
                        hLineWidth: function (i, node) {
                            return (i === 0 || i === node.table.body.length) ? 1 : 1;
                        },
                        vLineWidth: function (i, node) {
                            return (i === 0 || i === node.table.widths.length) ? 1 : 1;
                        },
                        hLineColor: function (i, node) {
                            return '#306cb8';
                        },
                        vLineColor: function (i, node) {
                            return '#306cb8';
                        },
                    }
                },
                {
                    text: 'Solution',
                    style: 'header4',
                    margin: [0, 20]
                },
                {
                    text: resiliencyReportData.ResiliencyResourceList[0].ResiliencyFeaturesList[6].SolutionComments,
                    style: 'paragraph',
                    alignment: 'justify'
                },
                { 
                    style: 'paragraph',
                    text: 'How to stop inactive Web Apps:\n',
                    bold: true 
                },
                { 
                    text: 'Stop non production apps to avoid exhausting system resources.' 
                },
                {
                    style: 'paragraph',
                    ol: [
                            { text: ['Navigate to the ', {text: 'App Service Plan ', bold: true },{ text: 'in the ' }, { text: 'Azure Portal', bold: true }] },
                            { text: ['While on the ', { text: 'Overview ', bold: true }, { text: 'blade, click on the link next to Apps(s) / Slots.'}] },
                            { text: 'Review the apps and slots listed there and stop the ones that are not critical'}
                        ]
                },                
                {
                    text: 'More information',
                    style: 'header4',
                    margin: [0, 20]
                },
                {
                    style: 'paragraph',
                    ul: [
                        { text: [ 'Azure App Service plan overview\n', { text: "https://docs.microsoft.com/en-us/azure/app-service/azure-web-sites-web-hosting-plans-in-depth-overview", color: 'blue', link: "https://docs.microsoft.com/en-us/azure/app-service/azure-web-sites-web-hosting-plans-in-depth-overview", alignment: 'left' , decoration: 'underline'}] }
                    ],
                },
                // End of App density section
                // ------------------------------------------
                // Start of SNAT port exhaustion section
                {
                    text: 'SNAT port exhaustion',
                    style: 'header3',
                    pageOrientation: 'portrait',
                    pageBreak: 'before',
                    tocItem: ['mainToc'],
                    tocStyle: { fontSize: 11 },
                    tocMargin: [0, 5, 0, 0]
                },
                {
                    text: 'Description',
                    style: 'header4',
                    margin: [0, 5]
                },
                {
                    text: 'Azure uses source network address translation (SNAT) and Load Balancers (not exposed to customers) to communicate with public IP addresses. Each instance on Azure App service is initially given a pre-allocated number of 128 SNAT ports. The SNAT port limit affects opening connections to the same address and port combination. If your app creates connections to a mix of address and port combinations, you will not use up your SNAT ports. The SNAT ports are used up when you have repeated calls to the same address and port combination. Once a port has been released, the port is available for reuse as needed. The Azure Network load balancer reclaims SNAT port from closed connections only after waiting for 4 minutes.',
                    style: 'paragraph',
                    alignment: 'justify'

                },
                {
                    text: 'Status of verified Web Apps',
                    style: 'header4',
                    margin: [0, 20]
                },
                {
                    margin: [0, 2],
                    alignment: 'center',
                    table: {
                        headerRows: 1,
                        widths: [109, 'auto', 329],
                        body: [
                            [
                                { text: 'Site name', style: 'detectTableheader' },
                                { text: 'Grade', style: 'detectTableheader' },
                                { text: 'Comments', style: 'detectTableheader' }
                            ],
                            [
                                { text: resiliencyReportData.ResiliencyResourceList[0].Name, style: 'detectTableevenrow', bold: true },
                                { text: ResiliencyScoreReportHelper.ScoreGrade(resiliencyReportData.ResiliencyResourceList[0].ResiliencyFeaturesList[7].ImplementationGrade), style: 'detectTableevenrow', bold:true, color: ResiliencyScoreReportHelper.GradeColor(resiliencyReportData.ResiliencyResourceList[0].ResiliencyFeaturesList[7].ImplementationGrade) },
                                { text: resiliencyReportData.ResiliencyResourceList[0].ResiliencyFeaturesList[7].GradeComments, style: 'detectTableevenrow', alignment: 'justify' }
                            ]
                        ]
                    },
                    layout: {
                        hLineWidth: function (i, node) {
                            return (i === 0 || i === node.table.body.length) ? 1 : 1;
                        },
                        vLineWidth: function (i, node) {
                            return (i === 0 || i === node.table.widths.length) ? 1 : 1;
                        },
                        hLineColor: function (i, node) {
                            return '#306cb8';
                        },
                        vLineColor: function (i, node) {
                            return '#306cb8';
                        },
                    }
                },
                {
                    text: 'Solution',
                    style: 'header4',
                    margin: [0, 20]
                },
                {
                    text: resiliencyReportData.ResiliencyResourceList[0].ResiliencyFeaturesList[7].SolutionComments,
                    style: 'paragraph',
                    alignment: 'justify'
                },
                {
                    text: 'If you have other Web Apps with SNAT issues, consider the following:\nYou should limit the number of outbound connections to the same URL/IP address/Port combination to 100 or less by using the following recommendations:\n',
                    style: 'paragraph',
                    alignment: 'justify'
                },
                {
                    style: 'paragraph',
                    ul: [
                        { text: ['Using the ', { text: 'Azure Portal', bold: true }, ':'] },
                        {
                            ul: [
                                'Modify the application to reuse connections',
                                'Modify the application to use connection pooling',
                                'Modify the application to use less aggressive retry logic',
                                'Use keepalives to reset the outbound idle timeout',
                                'Ensure the backend services can return response quickly',
                                'Scale out the App Service plan to more instances',
                                'Use App Service Environment, whose worker instance can have more SNAT ports, due to its smaller instances pool size',
                                'A load test should simulate real world data in a steady feeding speed',
                            ]
                        },
                    ]
                },
                {
                    text: 'More information',
                    style: 'header4',
                    margin: [0, 20]
                },
                {
                    style: 'paragraph',
                    ul: [
                        { text: [ 'Improper Instantiation antipattern (Code sample included)\n', { text: "https://docs.microsoft.com/en-us/azure/architecture/antipatterns/improper-instantiation/#how-to-fix-the-problem", color: 'blue', link: "https://docs.microsoft.com/en-us/azure/architecture/antipatterns/improper-instantiation/#how-to-fix-the-problem", alignment: 'left' , decoration: 'underline'}] } ,
                        { text: [ 'Troubleshooting intermittent outbound connection errors in Azure App Service\n', { text: "https://docs.microsoft.com/en-us/azure/architecture/antipatterns/improper-instantiation/#how-to-fix-the-problem", color: 'blue', link: "https://docs.microsoft.com/en-us/azure/architecture/antipatterns/improper-instantiation/#how-to-fix-the-problem", alignment: 'left' , decoration: 'underline'}] },
                        { text: [ 'Understanding SNAT with App Service\n', { text: "https://4lowtherabbit.github.io/blogs/2019/10/SNAT/", color: 'blue', link: "https://4lowtherabbit.github.io/blogs/2019/10/SNAT/", alignment: 'left' , decoration: 'underline'}] }                       
                    ],
                },
                // End of SNAT port exhaustion section
                // ------------------------------------------
                // Start of Other Best Practices for Availability & Performance section
                {
                    text: 'Other Best Practices for Availability & Performance',
                    style: 'header2',
                    pageOrientation: 'portrait',
                    pageBreak: 'before',
                    tocItem: ['mainToc'],
                    tocStyle: { fontSize: 11 },
                    tocMargin: [0, 5, 0, 0]
                },
                // End of Other Best Practices for Availability & Performance section
                // ------------------------------------------
                // Start of AlwaysOn Check section
                {
                    text: 'AlwaysOn Check',
                    style: 'header3',
                    pageOrientation: 'portrait',
                    tocItem: ['mainToc'],
                    tocStyle: { fontSize: 11 },
                    tocMargin: [10, 5, 0, 0]
                },
                {
                    text: 'Description',
                    style: 'header4',
                    margin: [0, 5]
                },
                {
                    text: 'Websites unload if they sit idle for too long, which helps the system conserve resources. Always On setting (available for Standard tier and above), keeps your site up and running, which translates to higher availability and faster response times across the board.\nKeeps the app loaded even when there\'s no traffic. It\'s required for continuous WebJobs or for WebJobs that are triggered using a CRON expression.\nIf Always On is enabled but there’s something preventing it from reaching the actual root of the Web App (like redirects due authentication/authorization/HTTPS Only, etc.), it might not be able to keep your application from going idle',
                    style: 'paragraph',
                    alignment: 'justify'

                },
                {
                    text: 'Status of verified Web Apps',
                    style: 'header4',
                    margin: [0, 20]
                },
                {
                    margin: [0, 2],
                    alignment: 'center',
                    table: {
                        headerRows: 1,
                        widths: [109, 'auto', 329],
                        body: [
                            [
                                { text: 'Site name', style: 'detectTableheader' },
                                { text: 'Grade', style: 'detectTableheader' },
                                { text: 'Comments', style: 'detectTableheader' }
                            ],
                            [
                                { text: resiliencyReportData.ResiliencyResourceList[0].Name, style: 'detectTableevenrow', bold: true },
                                { text: ResiliencyScoreReportHelper.ScoreGrade(resiliencyReportData.ResiliencyResourceList[0].ResiliencyFeaturesList[8].ImplementationGrade), style: 'detectTableevenrow', bold:true, color: ResiliencyScoreReportHelper.GradeColor(resiliencyReportData.ResiliencyResourceList[0].ResiliencyFeaturesList[8].ImplementationGrade) },
                                { text: resiliencyReportData.ResiliencyResourceList[0].ResiliencyFeaturesList[8].GradeComments, style: 'detectTableevenrow', alignment: 'justify' }
                            ]
                        ]
                    },
                    layout: {
                        hLineWidth: function (i, node) {
                            return (i === 0 || i === node.table.body.length) ? 1 : 1;
                        },
                        vLineWidth: function (i, node) {
                            return (i === 0 || i === node.table.widths.length) ? 1 : 1;
                        },
                        hLineColor: function (i, node) {
                            return '#306cb8';
                        },
                        vLineColor: function (i, node) {
                            return '#306cb8';
                        },
                    }
                },
                {
                    text: 'Solution',
                    style: 'header4',
                    margin: [0, 20]
                },
                {
                    text: resiliencyReportData.ResiliencyResourceList[0].ResiliencyFeaturesList[8].SolutionComments,
                    style: 'paragraph',
                    alignment: 'justify'
                },
                {
                    style: 'paragraph',
                    text: ['Enable ', { text: 'Always on', bold:true }]
                },
                {
                    style: 'paragraph',
                    ul: [
                        { text: ['Using the ', { text: 'Azure Portal', bold: true }, ':'] },
                        {
                            ol: [
                                'Browse to the Azure Portal (https://portal.azure.com) ',
                                'Click on the Portal menu on the top left corner',
                                { text: ['Click on ', {text: 'App Services', bold:true}]},
                                { text: ['Select the App Service for which you want to enable ', { text: 'Always on ', bold: true }] },
                                { text: ['Click on ', { text: 'Configuration', bold: true } ] },
                                { text: ['Click on ', { text: 'General settings', bold:true } ] },
                                { text: ['Change ', { text: 'Always on ', bold: true }, 'from Off to ', { text: 'On', bold: true }, '.'] },
                                { text: ['Click on ', { text: 'Save', bold: true }] },                                
                            ]
                        },
                        { text: ['Using the ', { text: 'Azure AzPowerShell', bold: true }, ':'] },
                        {
                            ol: [
                                { text: [ 'Use the ', {text: 'Set-AzWebApp ', bold:true}, 'cmdlet with the ', {text: '-AlwaysOn', bold:true}, 'set to true\nFor example:\n']},
                                '$app = Get-AzWebApp -ResourceGroupName $ResourceGroupName -Name $ApplicationName',
                                '$app.SiteConfig.AlwaysOn = $false',
                                '$app | Set-AzWebApp '
                            ]
                        },
                        { text: ['Using ', { text: 'Azure CLI', bold: true }, ':'] },
                        {
                            ol: [
                                { text: [ 'Use ', {text: 'az web app config set', bold:true}, ':\nFor example:\n az webapp config set -g MyResourceGroup -n MyUniqueApp --always-on true' ] },
                            ]
                        },
                    ]
                },
                {
                    text: 'More information',
                    style: 'header4',
                    margin: [0, 20]
                },
                {
                    style: 'paragraph',
                    ul: [
                        { text: [ 'Configure an App Service app in the Azure portal\n', { text: "https://docs.microsoft.com/en-us/azure/app-service/configure-common#configure-general-settings", color: 'blue', link: "https://docs.microsoft.com/en-us/azure/app-service/configure-common#configure-general-settings", alignment: 'left' , decoration: 'underline'}]
                        },
                        { text: [ 'Set-AzWebApp\n', { text: "https://docs.microsoft.com/en-us/powershell/module/az.websites/set-azwebapp?view=azps-5.7.0#parameters", color: 'blue', link: "https://docs.microsoft.com/en-us/powershell/module/az.websites/set-azwebapp?view=azps-5.7.0#parameters", alignment: 'left' , decoration: 'underline'}]
                        },
                        { text: [ 'az webapp config\n', { text: "https://docs.microsoft.com/en-us/cli/azure/webapp/config?view=azure-cli-latest#az-webapp-config-set", color: 'blue', link: "https://docs.microsoft.com/en-us/cli/azure/webapp/config?view=azure-cli-latest#az-webapp-config-set", alignment: 'left' , decoration: 'underline'}]
                        }
                    ]
                },
                // End of AlwaysOn Check section
                // ------------------------------------------
                // Start of App Service Advisor Recommendations section
                {
                    text: 'App Service Advisor Recommendations',
                    style: 'header3',
                    pageOrientation: 'portrait',
                    pageBreak: 'before',
                    tocItem: ['mainToc'],
                    tocStyle: { fontSize: 11 },
                    tocMargin: [10, 5, 0, 0]
                },
                {
                    text: 'Description',
                    style: 'header4',
                    margin: [0, 5]
                },
                {
                    text: 'Azure Advisor integrates recommendations for improving your App Service experience and discovering relevant platform capabilities. Examples of App Service recommendations are:',
                    style: 'paragraph',
                    alignment: 'justify'

                },
                {
                    ul: [
                        'Detection of instances where memory or CPU resources are exhausted by app runtimes, with mitigation options.',
                        'Detection of instances where co-locating resources like web apps and databases can improve performance and reduce cost'
                    ]
                },
                {
                    text: 'Status of verified Web Apps',
                    style: 'header4',
                    margin: [0, 20]
                },
                {
                    margin: [0, 2],
                    alignment: 'center',
                    table: {
                        headerRows: 1,
                        widths: [109, 'auto', 329],
                        body: [
                            [
                                { text: 'Site name', style: 'detectTableheader' },
                                { text: 'Grade', style: 'detectTableheader' },
                                { text: 'Comments', style: 'detectTableheader' }
                            ],
                            [
                                { text: resiliencyReportData.ResiliencyResourceList[0].Name, style: 'detectTableevenrow', bold: true },
                                { text: ResiliencyScoreReportHelper.ScoreGrade(resiliencyReportData.ResiliencyResourceList[0].ResiliencyFeaturesList[9].ImplementationGrade), style: 'detectTableevenrow', bold:true, color: ResiliencyScoreReportHelper.GradeColor(resiliencyReportData.ResiliencyResourceList[0].ResiliencyFeaturesList[9].ImplementationGrade) },
                                { text: resiliencyReportData.ResiliencyResourceList[0].ResiliencyFeaturesList[9].GradeComments, style: 'detectTableevenrow', alignment: 'justify' }
                            ]
                        ]
                    },
                    layout: {
                        hLineWidth: function (i, node) {
                            return (i === 0 || i === node.table.body.length) ? 1 : 1;
                        },
                        vLineWidth: function (i, node) {
                            return (i === 0 || i === node.table.widths.length) ? 1 : 1;
                        },
                        hLineColor: function (i, node) {
                            return '#306cb8';
                        },
                        vLineColor: function (i, node) {
                            return '#306cb8';
                        },
                    }
                },
                {
                    text: 'Solution',
                    style: 'header4',
                    margin: [0, 20]
                },
                {
                    text: resiliencyReportData.ResiliencyResourceList[0].ResiliencyFeaturesList[9].SolutionComments,
                    style: 'paragraph',
                    alignment: 'justify'
                },
                {
                    text: ['Just keep reviewing periodically ', {text: 'App Service Advisory ', bold:true}, 'recommendations:'],
                    style: 'paragraph',
                    alignment: 'justify'
                },
                {
                    style: 'paragraph',
                    ul: [
                        { text: ['Using the ', { text: 'Azure Portal', bold: true }, ':'] },
                        {
                            ul: [
                                { text: ['Open the ', { text: 'Azure Portal', bold: true }] },
                                { text: ['Click on an ', { text: 'App Services', bold: true }] },
                                'Click on the Web App for which you want to review App Service Advisory recommendations',
                                { text: ['Under ', { text: 'Support + troubleshooting', bold: true }, ', click on ', { text: 'App Service Advisor', bold: true } ] }                                
                            ]
                        },
                    ]
                },
                {
                    text: 'More information',
                    style: 'header4',
                    margin: [0, 20]
                },
                {
                    style: 'paragraph',
                    ul: [                        
                        { text: [ 'Improve the performance of Azure applications by using Azure Advisor - Improve App Service performance and reliability\n', { text: "https://docs.microsoft.com/en-us/azure/advisor/advisor-performance-recommendations#improve-app-service-performance-and-reliability", color: 'blue',link: "https://docs.microsoft.com/en-us/azure/advisor/advisor-performance-recommendations#improve-app-service-performance-and-reliability", alignment: 'left' , decoration: 'underline'}]
                        },
                        { text: [ 'Best Practices for Azure App Service\n', { text: "https://docs.microsoft.com/en-us/azure/app-service/app-service-best-practices", color: 'blue',link: "https://docs.microsoft.com/en-us/azure/app-service/app-service-best-practices", alignment: 'left' , decoration: 'underline'}]
                        }
                    ],
                },
                // End of App Service Advisor Recommendations section
                // ------------------------------------------
                // Start of ARR Affinity Check (Recommendation. Not counted against the score) section
                {
                    text: 'ARR Affinity Check (Recommendation. Not counted against the score)',
                    style: 'header3',
                    pageOrientation: 'portrait',
                    pageBreak: 'before',
                    tocItem: ['mainToc'],
                    tocStyle: { fontSize: 11 },
                    tocMargin: [10, 5, 0, 0]
                },
                {
                    text: 'Description',
                    style: 'header4',
                    margin: [0, 5]
                },
                {
                    text: 'ARR Affinity creates sticky sessions so that clients will connect to the same app instance on subsequent requests. However, ARR Affinity can cause unequal distribution of requests between your instances and possibly overload an instance. For production apps that are aiming to be robust, it is recommended to set Always on to On and ARR Affinity to Off. Disabling ARR Affinity assumes that your application is either stateless, or the session state is stored on a remote service such as a cache or database.\nUsing ARR Affinity for a stateful application is not very reliable as instances could be restarted/replaced at any given time and that will make the client lose its session state.\nWe are not counting this against the score to account for those customers whose applications rely on ARR Affinity.',
                    style: 'paragraph',
                    alignment: 'justify'

                },
                {
                    text: 'Status of verified Web Apps',
                    style: 'header4',
                    margin: [0, 20]
                },
                {
                    margin: [0, 2],
                    alignment: 'center',
                    table: {
                        headerRows: 1,
                        widths: [109, 'auto', 329],
                        body: [
                            [
                                { text: 'Site name', style: 'detectTableheader' },
                                { text: 'Grade', style: 'detectTableheader' },
                                { text: 'Comments', style: 'detectTableheader' }
                            ],
                            [
                                { text: resiliencyReportData.ResiliencyResourceList[0].Name, style: 'detectTableevenrow', bold: true },
                                { text: ResiliencyScoreReportHelper.ScoreGrade(resiliencyReportData.ResiliencyResourceList[0].ResiliencyFeaturesList[10].ImplementationGrade), style: 'detectTableevenrow', bold:true, color: ResiliencyScoreReportHelper.GradeColor(resiliencyReportData.ResiliencyResourceList[0].ResiliencyFeaturesList[10].ImplementationGrade) },
                                { text: resiliencyReportData.ResiliencyResourceList[0].ResiliencyFeaturesList[10].GradeComments, style: 'detectTableevenrow', alignment: 'justify' }
                            ]
                        ]
                    },
                    layout: {
                        hLineWidth: function (i, node) {
                            return (i === 0 || i === node.table.body.length) ? 1 : 1;
                        },
                        vLineWidth: function (i, node) {
                            return (i === 0 || i === node.table.widths.length) ? 1 : 1;
                        },
                        hLineColor: function (i, node) {
                            return '#306cb8';
                        },
                        vLineColor: function (i, node) {
                            return '#306cb8';
                        },
                    }
                },
                {
                    text: 'Solution',
                    style: 'header4',
                    margin: [0, 20]
                },
                {
                    text: resiliencyReportData.ResiliencyResourceList[0].ResiliencyFeaturesList[10].SolutionComments,
                    style: 'paragraph',
                    alignment: 'justify'
                },
                {
                    style: 'paragraph',
                    ul: [
                        'To disable ARR Affinity:',
                        {
                            ol: [
                                { text: ['Open the ', { text: 'Azure Portal', bold: true }] },
                                { text: ['Click on ', { text: 'App Services', bold: true }] },
                                'Click on the Web App for which you want to disable ARR Affinity',
                                { text: ['Under ', { text: 'Settings ', bold: true }, 'click on ', { text: 'Configuration', bold: true }, { text: ' then '}, { text: 'General settings', bold: true }, '.'] },
                                { text: ['Set ', { text: 'ARR affinity ', bold: true }, 'to ', {text: 'Off', bold:true}] }                                
                            ]
                        },
                    ]
                },
                {
                    text: 'More information',
                    style: 'header4',
                    margin: [0, 20]
                },
                {
                    style: 'paragraph',
                    ul: [
                        { text: [ 'The Ultimate Guide to Running Healthy Apps in the Cloud - Set your Health Check path\n', { text: "https://azure.github.io/AppService/2020/05/15/Robust-Apps-for-the-cloud.html#set-your-health-check-path", color: 'blue',link: "https://azure.github.io/AppService/2020/05/15/Robust-Apps-for-the-cloud.html#set-your-health-check-path", alignment: 'left' , decoration: 'underline'}]
                        }
                    ]
                },
                // End of ARR Affinity Check (Recommendation. Not counted against the score) section
                // ------------------------------------------
                // Start of Production SKU used section
                {
                    text: 'Production SKU used',
                    style: 'header3',
                    pageOrientation: 'portrait',
                    pageBreak: 'before',
                    tocItem: ['mainToc'],
                    tocStyle: { fontSize: 11 },
                    tocMargin: [10, 5, 0, 0]
                },
                {
                    text: 'Description',
                    style: 'header4',
                    margin: [0, 5]
                },
                {
                    text: 'Azure App Service brings together everything you need to create websites, mobile backends, and web APIs for any platform or device. Free and Shared (preview) plans provide different options to test your apps within your budget. Basic, Standard and Premium plans are for production workloads and run on dedicated Virtual Machine instances. Each instance can support multiple application and domains. The Isolated plan hosts your apps in a private, dedicated Azure environment and is ideal for apps that require secure connections with your on-premises network, or additional performance and scale. App Service plans are billed on a per second basis.',
                    style: 'paragraph',
                    alignment: 'justify'

                },
                {
                    text: 'Status of verified Web Apps',
                    style: 'header4',
                    margin: [0, 20]
                },
                {
                    margin: [0, 2],
                    alignment: 'center',
                    table: {
                        headerRows: 1,
                        widths: [109, 'auto', 329],
                        body: [
                            [
                                { text: 'Site name', style: 'detectTableheader' },
                                { text: 'Grade', style: 'detectTableheader' },
                                { text: 'Comments', style: 'detectTableheader' }
                            ],
                            [
                                { text: resiliencyReportData.ResiliencyResourceList[0].Name, style: 'detectTableevenrow', bold: true },
                                { text: ResiliencyScoreReportHelper.ScoreGrade(resiliencyReportData.ResiliencyResourceList[0].ResiliencyFeaturesList[11].ImplementationGrade), style: 'detectTableevenrow', bold:true, color: ResiliencyScoreReportHelper.GradeColor(resiliencyReportData.ResiliencyResourceList[0].ResiliencyFeaturesList[11].ImplementationGrade) },
                                { text: resiliencyReportData.ResiliencyResourceList[0].ResiliencyFeaturesList[11].GradeComments, style: 'detectTableevenrow', alignment: 'justify' }
                            ]
                        ]
                    },
                    layout: {
                        hLineWidth: function (i, node) {
                            return (i === 0 || i === node.table.body.length) ? 1 : 1;
                        },
                        vLineWidth: function (i, node) {
                            return (i === 0 || i === node.table.widths.length) ? 1 : 1;
                        },
                        hLineColor: function (i, node) {
                            return '#306cb8';
                        },
                        vLineColor: function (i, node) {
                            return '#306cb8';
                        },
                    }
                },
                {
                    text: 'Solution',
                    style: 'header4',
                    margin: [0, 20]
                },
                {
                    text: resiliencyReportData.ResiliencyResourceList[0].ResiliencyFeaturesList[11].SolutionComments,
                    style: 'paragraph',
                    alignment: 'justify'
                },
                {
                    text: 'For Web Apps that are not under a Production SKU, to scale up the App Service Plan using the Azure Portal:',
                    style: 'paragraph',
                    alignment: 'justify'
                },
                {
                    style: 'paragraph',
                    ul: [
                        { text: ['Using the ', { text: 'Azure Portal', bold: true }, ':'] },
                        {
                            ul: [
                                { text: ['Open the ', { text: 'Azure Portal', bold: true }] },
                                { text: ['Click on ', { text: 'App Service Plans', bold: true }] },
                                'Click on the App Service Plan hosting the Web App(s) you want to scale out',
                                { text: ['Under ', { text: 'Settings ', bold: true }, 'click on ', { text: 'Scale up (App Service Plan)', bold: true } ] },
                                { text: ['Select any plan under the ', { text: 'Production ', bold: true }, 'tab'] }                                
                            ]
                        },
                    ]
                },
                {
                    text: 'More information',
                    style: 'header4',
                    margin: [0, 20]
                },
                {
                    style: 'paragraph',
                    ul: [
                        { text: ['App Service pricing\n', {text: "https://azure.microsoft.com/en-us/pricing/details/app-service/windows", color: 'blue', link: "https://azure.microsoft.com/en-us/pricing/details/app-service/windows", alignment: 'left' , decoration: 'underline'} ] }                        
                    ]
                },
               // End of Production SKU used section
            ],
            styles: {
                header: {
                    font: 'Calibri',
                    fontSize: 28,
                    bold: false
                },
                header2: {                    
                    font: 'Calibri',
                    fontSize: 16,
                    color: '#10438e',
                    lineHeight: 2
                },
                header3: {
                    font: 'Calibri',
                    fontSize: 16,
                    color: '#10438e'
                },
                header4: {
                    font: 'Calibri',
                    fontSize: 13,
                    color: '#10438e'
                },
                title2: {
                    alignment: 'center',
                    font: 'Calibri',
                    fontSize: 28,
                    light: true
                },
                paragraph: {
                    font: 'Calibri',
                    fontSize: 11,
                    lineHeight: 1.2,
                    alignment: 'justify'
                },
                apsrcTableevenrow: {
                    bold: true,
                    fontSize: 18,
                    fillColor: '#dde9f7'
                },
                apsrcTableoddrow: {
                    bold: true,
                    fontSize: 18,
                    fillColor: 'white'
                },
                apsrcTableheader: {
                    color: 'white',
                    bold: true,
                    fontSize: 18,
                    fillColor: '#5B9BD5'
                },
                rspfTableheader: {
                    color: 'white',
                    bold: true,
                    fontSize: 11,
                    fillColor: '#5B9BD5',
                    alignment: 'center'
                },
                detectTableheader: {
                    font: 'Calibri',
                    color: 'white',
                    bold: true,
                    fontSize: 11,
                    fillColor: '#5B9BD5'
                },
                detectTableevenrow: {
                    font: 'Calibri',
                    fontSize: 11,
                    fillColor: '#dde9f7'
                },
                detectTableoddrow: {
                    font: 'Calibri',
                    fontSize: 11,
                    fillColor: 'white'
                },
                maxSiteperWorkerSizeheader: {
                    font: 'Calibri',
                    color: 'white',
                    bold: true,
                    fontSize: 11,
                    fillColor: 'black'
                },
                maxSiteperWorkerSizeevenrow: {
                    font: 'Calibri',
                    color: 'black',
                    fontSize: 11,
                    fillColor: 'gray'//'#848b79' //Sage gray
                },
                maxSiteperWorkerSizeoddrow: {
                    font: 'Calibri',
                    color: 'black',
                    fontSize: 11,
                    fillColor: 'white'
                },
            }
        }   
        pdfMake.createPdf(docDefinition).download(`ResiliencyReport-${resiliencyReportData.ResiliencyResourceList[0].Name}-${ResiliencyScoreReportHelper.generatedOn().replace(":","-")}.pdf`);
        console.log("Resiliency Score Report");
    }

}
