const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const paySlipDocumentPreparationSchema = new Schema({
    date: {
        type: String,
        required: false,
    },
    employeemode: {
        type: String,
        required: false,
    },
    template: {
        type: String,
        required: false,
    },
    filtertype: {
        type: String,
        required: false,
    },
    empstatus: {
        type: String,
        required: false,
    },
    productionmonth: {
        type: String,
        required: false,
    },
    productionyear: {
        type: String,
        required: false,
    },
    company: {
        type: String,
        required: false,
    },
    employeemode: {
        type: String,
        required: false,
    },
    signature: {
        type: String,
        required: false,
    },
    signaturepreview: {
        type: String,
        required: false,
    },
    seal: {
        type: String,
        required: false,
    },
    sealpreview: {
        type: String,
        required: false,
    },
    signatureSealNeed: {
        type: String,
        required: false,
    },
    choosedetails: {
        type: String,
        required: false,
    },
    qrcodeneed: {
        type: String,
        required: false,
    },
    branch: {
        type: [String],
        required: false,
    },
    unit: {
        type: [String],
        required: false,
    },
    team: {
        type: [String],
        required: false,
    },




    // print: {
    //     type: String,
    //     required: false,
    // },

    // pagesize: {
    //     type: String,
    //     required: false,
    // },
    // head: {
    //     type: String,
    //     required: false,
    // },
    // foot: {
    //     type: String,
    //     required: false,
    // },
    // headvalue: {
    //     type: [String],
    //     required: false,
    // },
    // signature: {
    //     type: String,
    //     required: false,
    // },
    // tempcode: {
    //     type: String,
    //     required: false,
    // },
    // sign: {
    //     type: String,
    //     required: false,
    // },
    // sealing: {
    //     type: String,
    //     required: false,
    // },
    // seal: {
    //     type: String,
    //     required: false,
    // },
    // email: {
    //     type: String,
    //     required: false,
    // },
    // mail: {
    //     type: String,
    //     required: false,
    // },
    // issuedpersondetails: {
    //     type: String,
    //     required: false,
    // },
    paySlipTodo: [
        {
            branch: {
                type: String,
                required: false,
            },
            unit: {
                type: String,
                required: false,
            },
            team: {
                type: String,
                required: false,
            },
            companyname: {
                type: String,
                required: false,
            },
            qrcode: {
                type: String,
                required: false,
            },
            generatedby: {
                type: String,
                required: false,
            },
            generateddate: {
                type: String,
                required: false,
            },
            usermail: {
                type: String,
                required: false,
            },
            username: {
                type: String,
                required: false,
            },
            department: {
                type: String,
                required: false,
            },
            userid: {
                type: String,
                required: false,
            },
            sealid: {
                type: String,
                required: false,
            },
            signatureid: {
                type: String,
                required: false,
            },
            backgroundimageid: {
                type: String,
                required: false,
            },
            index: {
                type: String,
                required: false,
            },
            month: {
                type: String,
                required: false,
            },
            year: {
                type: String,
                required: false,
            },
            template: {
                type: String,
                required: false,
            },
        },
    ],
    addedby: [
        {
            name: {
                type: String,
                required: false,
            },
            date: {
                type: String,
                required: false,
            },
        },
    ],
    updatedby: [
        {
            name: {
                type: String,
                required: false,
            },
            date: {
                type: String,
                required: false,
            },
        },
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
module.exports = mongoose.model("paySlipDocumentPreparation", paySlipDocumentPreparationSchema);