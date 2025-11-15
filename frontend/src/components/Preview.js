import React, { useEffect, useState, useRef } from "react";

const PagePreview = ({ agenda, width, height, margins }) => {
  const [pages, setPages] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const tempDivRef = useRef(null);

  // 🧩 Define base margin presets (in px)
  const marginValues = {
    normal: [96, 96, 96, 96],
    narrow: [48, 48, 48, 48],
    moderate: [96, 72, 96, 72],
    wide: [96, 192, 96, 192],
    mirrored: [96, 120, 96, 96],
    office2003: [96, 120, 96, 120],
  };

  // 🧮 Helper: convert px → mm
  const pxToMm = (px) => px * 0.264583;

  // 🧮 Convert all sides to mm
  const convertPxArrayToMm = (arr) => arr.map(pxToMm);

  // 🎯 Replacement for getMarginValues
  const getMarginValues = (selectedMargin, headImage, footImage) => {
    const base = marginValues[selectedMargin] || marginValues["narrow"];
    let [top, right, bottom, left] = base;

    // ⬆️ Add extra space for top and both sides (in px)
    const extraTop = 60; // increase top margin by +60px
    const extraSides = 40; // increase left & right margins by +40px

    top += extraTop;
    right += extraSides;
    left += extraSides;

    // Optional reserved space for footer elements like page numbers
    const footerReservedSpace = 60;

    // Adjust for header/footer image presence
    if (headImage) top += selectedMargin === "narrow" ? 80 : 35;
    if (footImage) bottom += selectedMargin === "narrow" ? 80 : 35;

    // Convert to mm for PDF accuracy
    const [topMm, rightMm, bottomMm, leftMm] = convertPxArrayToMm([
      top,
      right,
      bottom + footerReservedSpace,
      left,
    ]);

    // Return as an object (same format as before)
    return {
      top: topMm + 80,
      right: rightMm + 35,
      bottom: bottomMm + 90,
      left: leftMm + 35,
    };
  };

  // 🧩 Usage
  const resolvedMargins = getMarginValues(margins, true, true);

  // ✅ Inject custom CSS styles when preview is shown
  useEffect(() => {
    if (!showPreview) return;

    const styleElement = document.createElement("style");
    styleElement.textContent = `
      .ql-indent-1 { margin-left: 75px; }
      .ql-indent-2 { margin-left: 150px; }
      .ql-indent-3 { margin-left: 225px; }
      .ql-indent-4 { margin-left: 275px; }
      .ql-indent-5 { margin-left: 325px; }
      .ql-indent-6 { margin-left: 375px; }
      .ql-indent-7 { margin-left: 425px; }
      .ql-indent-8 { margin-left: 475px; }

      /* Light badge look (like TEST 1 - top) */
      .__se__t-code {
        display: inline-block;
        background: #f3f3f3;
        color: #222;
        padding: 4px 10px;
        border-radius: 6px;
        font-weight: 500;
        font-size: 14px;
        letter-spacing: 0.5px;
        box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.5);
      }

      /* Shadowed text (like TEST 1 - bottom) */
      .__se__t-shadow {
        font-weight: 600;
        color: #000;
        text-shadow: 0 3px 8px rgba(0, 0, 0, 0.35);
      }

      .ql-align-right { text-align: right; }
      .ql-align-left { text-align: left; }
      .ql-align-center { text-align: center; }
      .ql-align-justify { text-align: justify; }

      .page-break-label {
        page-break-before: always;
        break-before: page;
        margin: 20px 0;
      }

      table {
        border-collapse: collapse;
        width: 100%;
      }

      td, th {
        border: 1px solid #000;
        padding: 6px;
      }

      ol {
        padding-left: 20px;
        list-style-type: decimal;
      }

      ul {
        padding-left: 20px;
        list-style-type: disc;
      }

      tr:nth-child(even) {
        background-color: #f9f9f9;
      }
    `;
    document.head.appendChild(styleElement);

    // 🧹 Cleanup on close
    return () => {
      if (styleElement.parentNode) {
        styleElement.parentNode.removeChild(styleElement);
      }
    };
  }, [showPreview]);

  useEffect(() => {
    if (!showPreview || !agenda) return;

    const pageHeightLimit =
      height - resolvedMargins.top - resolvedMargins.bottom;
    const measureDiv = document.createElement("div");
    measureDiv.style.width = `${
      width - resolvedMargins.left - resolvedMargins.right
    }px`;
    measureDiv.style.position = "absolute";
    measureDiv.style.visibility = "hidden";
    measureDiv.style.whiteSpace = "normal";
    measureDiv.style.lineHeight = "1.5";
    measureDiv.style.fontSize = "14px";
    measureDiv.style.wordWrap = "break-word";
    measureDiv.style.padding = "0";
    document.body.appendChild(measureDiv);

    const wrapper = document.createElement("div");
    wrapper.innerHTML = agenda;

    let currentHTML = "";
    const generatedPages = [];

    const addToPage = (html) => {
      measureDiv.innerHTML = html;
      return measureDiv.scrollHeight;
    };

    const allParagraphs = Array.from(wrapper.childNodes);
    for (let p of allParagraphs) {
      const pHTML = p.outerHTML || p.textContent || "";

      measureDiv.innerHTML = currentHTML + pHTML;

      if (
        measureDiv.scrollHeight > pageHeightLimit &&
        currentHTML.trim() !== ""
      ) {
        if (p.textContent && p.textContent.length > 200) {
          const words = p.textContent.split(" ");
          let tempText = "";
          for (let w of words) {
            const test = tempText + " " + w;
            measureDiv.innerHTML = currentHTML + `<p>${test}</p>`;
            if (measureDiv.scrollHeight > pageHeightLimit) {
              generatedPages.push(currentHTML + `<p>${tempText}</p>`);
              currentHTML = "";
              tempText = w;
            } else {
              tempText = test;
            }
          }
          currentHTML += `<p>${tempText}</p>`;
        } else {
          generatedPages.push(currentHTML);
          currentHTML = pHTML;
        }
      } else {
        currentHTML += pHTML;
      }
    }

    if (currentHTML.trim() !== "") generatedPages.push(currentHTML);

    setPages(generatedPages);
    document.body.removeChild(measureDiv);
  }, [agenda, width, height, resolvedMargins, showPreview]);

  const handleClose = () => {
    setShowPreview(false);
    setPages([]);
  };

  return (
    <>
      {!showPreview && (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <button
            onClick={() => setShowPreview(true)}
            style={{
              background: "#007bff",
              color: "white",
              border: "none",
              padding: "10px 24px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "15px",
            }}
          >
            Preview
          </button>
        </div>
      )}

      {showPreview && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.7)",
            zIndex: 9999,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              background: "white",
              width: "90%",
              height: "90%",
              borderRadius: "12px",
              overflowY: "auto",
              position: "relative",
              padding: "20px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            }}
          >
            <button
              onClick={handleClose}
              style={{
                position: "absolute",
                top: "15px",
                right: "20px",
                background: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "50%",
                width: "30px",
                height: "30px",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              ×
            </button>

            <div style={{ textAlign: "center" }}>
              {pages.map((page, i) => (
                <div
                  key={i}
                  style={{
                    width: `${width}px`,
                    height: `${height}px`,
                    background: "white",
                    margin: "20px auto",
                    boxShadow: "0 0 6px rgba(0,0,0,0.15)",
                    padding: `${resolvedMargins.top}px ${resolvedMargins.right}px ${resolvedMargins.bottom}px ${resolvedMargins.left}px`,
                    overflow: "hidden",
                    textAlign: "left",
                  }}
                  dangerouslySetInnerHTML={{ __html: page }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PagePreview;
