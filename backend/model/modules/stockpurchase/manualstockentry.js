const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ManualstockSchema = new Schema
    ({

        company: {
            type: String,
            required: false,
        },
        branch: {
            type: String,
            required: false,
        },
        unit: {
            type: String,
            required: false,
        },
        floor: {
            type: String,
            required: false,
        },
        location: {
            type: String,
            required: false,
        },
        area: {
            type: String,
            required: false,
        },
        workcheck: {
            type: Boolean,
            required: false,
        },
        producthead: {
            type: String,
            required: false,
        },
        vendorgroup: {
            type: String,
            require: false,
        },
        vendorname: {
            type: String,
            require: false,
        },
        gstno: {
            type: String,
            required: false,
        },
        billno: {
            type: Number,
            require: false,
        },
        assettype: {
            type: String,
            required: false,
        },
        asset: {
            type: String,
            required: false,
        },
        productname: {
            type: String,
            required: false,
        },
        productdetails: {
            type: String,
            require: false,
        },
        warrantydetails: {
            type: String,
            require: false,
        },
        uom: {
            type: String,
            require: false,
        },
        quantity: {
            type: Number,
            require: false,
        },
        rate: {
            type: Number,
            require: false,
        },
        billdate: {
            type: String,
            require: false,
        },
        component: {
            type: String,
            required: false,
        },
        workstation: {
            type: String,
            required: false,
        },
        vendorid: {
            type: String,
            require: false,
        },
        material: {
            type: String,
            required: false,
        },
        warranty: {
            type: String,
            required: false,
        },
        estimation: {
            type: String,
            required: false,
        },
        estimationtime: {
            type: String,
            required: false,
        },
        warrantycalculation: {
            type: String,
            required: false,
        },
        purchasedate: {
            type: String,
            required: false,
        },


        requestmode: {
            type: String,
            require: false,
        },
        stockcategory: {
            type: String,
            require: false,
        },
        stocksubcategory: {
            type: String,
            require: false,
        },
        stockmaterialarray: [
            {
                uomnew: {
                    type: String,
                    required: false,
                },
                quantitynew: {
                    type: String,
                    required: false,
                },
                materialnew: {
                    type: String,
                    required: false,
                },
                productdetailsnew: {
                    type: String,
                    require: false,
                },
                uomcodenew: {
                    type: String,
                    require: false,
                },
            },
        ],

        subcomponent: [
            {
subcomponentcheck: {
                    type: Boolean,
                    required: false,
                },
                sub: {
                    type: String,
                    required: false,
                },
                subname: {
                    type: String,
                    required: false,
                },
                type: {
                    type: String,
                    required: false,
                },
                model: {
                    type: String,
                    required: false,
                },
                size: {
                    type: String,
                    required: false,
                },
                variant: {
                    type: String,
                    required: false,
                },

                brand: {
                    type: String,
                    required: false,
                },

                serial: {
                    type: String,
                    required: false,
                },
                other: {
                    type: String,
                    required: false,
                },
                capacity: {
                    type: String,
                    required: false,
                },
                hdmiport: {
                    type: String,
                    required: false,
                },
                vgaport: {
                    type: String,
                    required: false,
                },
                dpport: {
                    type: String,
                    required: false,
                },
                usbport: {
                    type: String,
                    required: false,
                },
                paneltypescreen: {
                    type: String,
                    required: false,
                },
                resolution: {
                    type: String,
                    required: false,
                },
                connectivity: {
                    type: String,
                    required: false,
                },
                daterate: {
                    type: String,
                    required: false,
                },
                compatibledevice: {
                    type: String,
                    required: false,
                },
                outputpower: {
                    type: String,
                    required: false,
                },
                collingfancount: {
                    type: String,
                    required: false,
                },
                clockspeed: {
                    type: String,
                    required: false,
                },
                core: {
                    type: String,
                    required: false,
                },
                speed: {
                    type: String,
                    required: false,
                },
                frequency: {
                    type: String,
                    required: false,
                },
                output: {
                    type: String,
                    required: false,
                },
                ethernetports: {
                    type: String,
                    required: false,
                },
                distance: {
                    type: String,
                    required: false,
                },
                lengthname: {
                    type: String,
                    required: false,
                },
                slot: {
                    type: String,
                    required: false,
                },
                noofchannels: {
                    type: String,
                    required: false,
                },
                colours: {
                    type: String,
                    required: false,
                },
                warranty: {
                    type: String,
                    required: false,
                },
                estimation: {
                    type: String,
                    required: false,
                },
                vendorid: {
                    type: String,
                    require: false,
                },
                phonenumber: {
                    type: String,
                    require: false,
                },
                address: {
                    type: String,
                    require: false,
                },
                estimationtime: {
                    type: String,
                    required: false,
                },
                warrantycalculation: {
                    type: String,
                    required: false,
                },
                purchasedate: {
                    type: String,
                    required: false,
                },
                vendorgroup: {
                    type: String,
                    require: false,
                },
                vendor: {
                    type: String,
                    required: false,
                },
                gstno: {
                    type: String,
                    required: false,
                },
            },
        ],


        files: [
            {
                base64: {
                    type: String,
                    required: false,
                },
                name: {
                    type: String,
                    required: false,
                },
                preview: {
                    type: String,
                    required: false,
                },
                size: {
                    type: String,
                    required: false,
                },
                type: {
                    type: String,
                    required: false,
                },
            },
        ],
        warrantyfiles: [
            {
                base64: {
                    type: String,
                    required: false,
                },
                name: {
                    type: String,
                    required: false,
                },
                preview: {
                    type: String,
                    required: false,
                },
                size: {
                    type: String,
                    required: false,
                },
                type: {
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

module.exports = mongoose.model("Manualstock", ManualstockSchema);
