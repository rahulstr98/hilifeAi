const workStation = require("../model/modules/workstationmodel");
const Company = require("../model/modules/setup/company");
const Branch = require("../model/modules/branch");
const Unit = require("../model/modules/unit");

const WorkStationShortNameGeneration = async () => {
    try {
        let res_employee = await workStation.find().lean();
        let res_company = await Company.find().lean();
        let res_branch = await Branch.find().lean();
        let res_unit = await Unit.find().lean();
        const result = res_employee?.flatMap((item) => {
            return item.combinstation.flatMap((combinstationItem) => {
                return combinstationItem.subTodos.length > 0
                    ? combinstationItem.subTodos.map((subTodo) => {
                        return {
                            company: item.company, branch: item.branch, unit: item.unit, floor: item.floor, id: item._id,
                            cabinname: subTodo.subcabinname
                        }
                    })
                    : [{
                        company: item.company, branch: item.branch, unit: item.unit, floor: item.floor, id: item._id,
                        cabinname: combinstationItem.cabinname
                    }
                    ];
            });
        });
        const rescompanydata = result.map((data, index) => {
            let updatedData = data;
            res_company?.map((item, i) => {
                if (data.company === item.name) {
                    updatedData = { ...data, companycode: item.code };
                }
            });

            return updatedData;
        });

        const resBranchdata = rescompanydata.map((data, index) => {
            let updatedData = data;
            res_branch?.map((item, i) => {
                if (data.branch === item.name) {
                    updatedData = { ...data, branchcode: item.code };
                }
            });

            return updatedData;
        });

        const resUnitdata = resBranchdata.map((data, index) => {
            let updatedData = data;
            res_unit?.map((item, i) => {
                if (data.unit === item.name) {
                    updatedData = { ...data, unitcode: item.code };
                }
            });

            return updatedData;
        });
        // Calculate counts dynamically
        const counts = {};

        const updatedData = resUnitdata.map(obj => {

            const key = `${obj.company}-${obj.branch}-${obj.unit}-${obj.floor}`;
            obj.count = (counts[key] || 0) + 1;
            counts[key] = obj.count;

            obj.systemname = `${obj?.companycode}_${obj?.branchcode}#${obj.count}#${obj?.unitcode}_${obj.cabinname}`;

            obj.systemshortname = `${obj?.branchcode}_${obj.count}_${obj?.unitcode}_${obj.cabinname}`;

            return obj;
        });



        return updatedData
    }
    catch (err) {

    }

}

module.exports = WorkStationShortNameGeneration;