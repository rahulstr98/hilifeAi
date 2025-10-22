import React, { useEffect, useRef } from "react";
import html2canvas from "html2canvas";

export default function SalaryTable({
    name,
  salaryFixed,
  salaryStatus,
  expectedSalary,
  basic,
  hra,
  conveyance,
  medicalallowance,
  productionallowance,
  otherallowance,
  performanceincentive,
shiftallowance,
  grossmonthsalary,
  annualgrossctc,
  onImageGenerated,
  generateImage
}) {
  const tableRef = useRef();

//   useEffect(() => {
//     if (salaryFixed && tableRef.current) {
//       html2canvas(tableRef.current).then((canvas) => {
//         const imgData = canvas.toDataURL("image/png");
//         if (onImageGenerated) {
//           onImageGenerated(imgData);
//         }
//       });
//     }
//   }, [salaryFixed]);
useEffect(() => {
  if (salaryFixed && tableRef.current && generateImage) {
    html2canvas(tableRef.current).then((canvas) => {
      canvas.toBlob((blob) => {
        if (blob && onImageGenerated) {
          // Create a File object from the blob
          const file = new File([blob], "salary-table.png", { type: "image/png" });
          onImageGenerated(file);
        }
      }, "image/png");
    });
  }
}, [salaryFixed,
  basic,
  hra,
  conveyance,
  medicalallowance,
  productionallowance,
  otherallowance,
  performanceincentive,
shiftallowance,
  grossmonthsalary,
  annualgrossctc,
]);


  if (!salaryFixed) return null; // Hide table if salaryFixed is false

  return (
    <div
      ref={tableRef}
      style={{
        border: "1px solid black",
        width: "100%",
        padding: "5px",
        backgroundColor: "#fff",
        fontFamily: "Arial",
        fontSize: "14px"
      }}
    >
          {/* Extra info section */}
      {name && (
        <div style={{ marginBottom: "5px", fontWeight: "bold" }}>
         Name: {name}
        </div>
      )}
      {expectedSalary && (
        <div style={{ marginBottom: "5px", fontWeight: "bold" }}>
          Expected Salary: ₹{expectedSalary}
        </div>
      )}
      {salaryStatus === "WithOut Salary" && (
        <div style={{ marginBottom: "5px", color: "red", fontWeight: "bold" }}>
          The Below Mentioned salary will be provided after joining as an Employee
        </div>
      )}
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th style={headerStyle}>Component</th>
            <th style={headerStyleRight}>Amount (INR)</th>
          </tr>
        </thead>
        <tbody>
          <TableRow label="Basic" value={basic} />
          <TableRow label="House Rent Allowance (HRA)" value={hra} />
          <TableRow label="Conveyance Allowance" value={conveyance} />
          <TableRow label="Medical Allowance" value={medicalallowance} />
          <TableRow label="Production Allowance" value={productionallowance} />
          <TableRow label="Other Allowance" value={otherallowance} />
          <TableRow label="Performance Incentive (Optional)" value={performanceincentive} />
          {/* <TableRow label="Shift Allowance" value={shiftallowance} /> */}
          {/* <tr>
            <td colSpan="2" style={separatorStyle}></td>
          </tr> */}
          <TableRow label={<b>Gross Month Salary</b>} value={<b>{grossmonthsalary}</b>} />
          <TableRow label={<b>Annual Gross CTC</b>} value={<b>{annualgrossctc}</b>} />
        </tbody>
      </table>
    </div>
  );
}

function TableRow({ label, value }) {
  return (
    <tr>
      <td style={cellStyle}>{label}</td>
      <td style={cellStyleRight}>{value}</td>
    </tr>
  );
}

const headerStyle = {
  border: "1px solid black",
  padding: "5px",
  textAlign: "left",
  backgroundColor: "#f0f0f0"
};

const headerStyleRight = {
  ...headerStyle,
  textAlign: "right"
};

const cellStyle = {
  border: "1px solid black",
  padding: "5px",
  textAlign: "left"
};

const cellStyleRight = {
  border: "1px solid black",
  padding: "5px",
  textAlign: "right"
};

const separatorStyle = {
  borderBottom: "2px dashed black",
  height: "5px"
};
