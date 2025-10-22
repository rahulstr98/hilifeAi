const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const PowerpointSchema = new Schema({
    companylogo: {
        type: String,
        required: false,
    },
    categoryname: {
        type: String,
        required: false,
    },
    subcategoryname: {
        type: String,
        required: false,
    },
    documentname: {
        type: String,
        required: false,
    },
    isheadertext: {
        type: Boolean,
        required: false,
    },
    isfootertext: {
        type: Boolean,
        required: false,
    },
    isSlidenumber: {
        type: Boolean,
        required: false,
    },
    headertext: {
        type: String,
        required: false,
    },
    footertext: {
        type: String,
        required: false,
    },
    isheaderfootercolor: {
        type: Boolean,
        required: false,
    },
    headerfootercolor: {
        type: String,
        required: false,
    },



    slides: [
        {
            title: {
                type: String,
                required: false,
            },
            subtitle: {
                type: String,
                required: false,
            },
            titleFont: {
                type: String,
                required: false,
            },
            subtitleFont: {
                type: String,
                required: false,
            },
            titleFontSize: {
                type: Number,
                required: false,
            },
            subtitleFontSize: {
                type: Number,
                required: false,
            },
            alignitemstitle: {
                type: String,
                required: false,
            },
            alignitemssubtitle: {
                type: String,
                required: false,
            },
            alignitemssubtitletwo: {
                type: String,
                required: false,
            },
            images: [
                {
                    crossOrgin: {
                        type: String,
                        required: false,
                    },
                    src: {
                        type: String,
                        required: false,
                    },
                    h: {
                        type: Number,
                        required: false,
                    },
                    w: {
                        type: Number,
                        required: false,
                    },
                    x: {
                        type: Number,
                        required: false,
                    },
                    y: {
                        type: Number,
                        required: false,
                    },
                    xdrag: {
                        type: Number,
                        required: false,
                    },
                    ydrag: {
                        type: Number,
                        required: false,
                    }
                }
            ],
            istitleBold: {
                type: Boolean,
                required: false,
            },
            istitleitalic: {
                type: Boolean,
                required: false,
            },
            istitleunderline: {
                type: Boolean,
                required: false,
            },
            issubtitleBold: {
                type: Boolean,
                required: false,
            },
            issubtitleitalic: {
                type: Boolean,
                required: false,
            },
            issubtitleunderline: {
                type: Boolean,
                required: false,
            },


            layout: {
                type: String,
                required: false,
            },
            subtitleFontSizetwo: {
                type: Number,
                required: false,
            },
            subtitletwo: {
                type: String,
                required: false,
            },
            issubtitleBoldtwo: {
                type: Boolean,
                required: false,
            },
            issubtitleitalictwo: {
                type: Boolean,
                required: false,
            },
            issubtitleunderlinetwo: {
                type: Boolean,
                required: false,
            },
          

        }
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
module.exports = mongoose.model("Powerpoint", PowerpointSchema);
