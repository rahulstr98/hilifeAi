const Hirerarchi = require("../model/modules/setup/hierarchy");

async function Hierarchyfilter(hierarchyData, pagename) {
  try {
    console.log(pagename, hierarchyData, "pagename")
    const hierarchyResults = await Hirerarchi.find({
      level: { $in: hierarchyData }
    }).lean();
    console.log(hierarchyResults?.length, "hierarchyResults")
    const namesArray = hierarchyResults.flatMap((item) => {
      const employee = Array.isArray(item.employeename) ? item.employeename : [item.employeename];
      const supervisor = Array.isArray(item.supervisorchoose) ? item.supervisorchoose : [item.supervisorchoose];
      return [...employee, ...supervisor];
    });

    console.log(namesArray?.length, "namesArray")
    // console.log()
    // Remove undefined/null and duplicates
    const uniqueNames = [...new Set(namesArray.filter(Boolean))];

    const pageReportData = await Hirerarchi.aggregate([
      {
        $match: {
          level: { $in: hierarchyData } // Corrected unmatched quotation mark
        }
      },
      {
        $lookup: {
          from: "reportingheaders",
          let: {
            teamControlsArray: {
              $ifNull: ["$pagecontrols", []]
            }
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $in: [
                        "$name",
                        "$$teamControlsArray"
                      ]
                    }, // Check if 'name' is in 'teamcontrols' array
                    {
                      $in: [
                        pagename,
                        "$reportingnew" // Check if 'menuteamloginstatus' is in 'reportingnew' array
                      ]
                    } // Additional condition for reportingnew array
                  ]
                }
              }
            }
          ],
          as: "reportData" // The resulting matched documents will be in this field
        }
      },
      {
        $project: {
          supervisorchoose: 1,
          employeename: 1,
          reportData: 1
        }
      }
    ]);
console.log(pageReportData?.filter(data => data?.reportData?.length > 0)?.length, "pageReportData")
    const reportDataArray = pageReportData?.filter(data => data?.reportData?.length > 0)?.flatMap((item) => {
      const employee = Array.isArray(item.employeename) ? item.employeename : [item.employeename];
      const supervisor = Array.isArray(item.supervisorchoose) ? item.supervisorchoose : [item.supervisorchoose];
      return [...employee, ...supervisor];
    });
    const pageControlsData = [...new Set(reportDataArray.filter(Boolean))];

    console.log(reportDataArray?.length, 'reportDataArray')
    return {
      uniqueNames,
      pageControlsData
    };
  } catch (error) {
    console.error("Error fetching hierarchy data:", error);
    return {
      uniqueNames: [],
      pageControlsData: []
    };
  }
}

module.exports = { Hierarchyfilter };
