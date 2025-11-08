import React, { useEffect, useState, useRef } from "react";

const PagePreview = ({ agenda, width, height, margins }) => {
  const [pages, setPages] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const tempDivRef = useRef(null);

  const getMarginValues = (type) => {
    switch (type) {
      case "narrow":
        return { top: 36, right: 36, bottom: 36, left: 36 };
      case "wide":
        return { top: 108, right: 108, bottom: 108, left: 108 };
      default:
        return { top: 72, right: 72, bottom: 72, left: 72 };
    }
  };

  const resolvedMargins = getMarginValues(margins);

  useEffect(() => {
    if (!showPreview || !agenda) return;

    const pageHeightLimit = height - resolvedMargins.top - resolvedMargins.bottom;
    const measureDiv = document.createElement("div");
    measureDiv.style.width = `${width - resolvedMargins.left - resolvedMargins.right}px`;
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

    // Go through text progressively (paragraphs first, then split long ones)
    const allParagraphs = Array.from(wrapper.childNodes);
    for (let p of allParagraphs) {
      const pHTML = p.outerHTML || p.textContent || "";

      measureDiv.innerHTML = currentHTML + pHTML;

      if (measureDiv.scrollHeight > pageHeightLimit && currentHTML.trim() !== "") {
        // Check if it’s a long paragraph (overflowing itself)
        if (p.textContent && p.textContent.length > 200) {
          const words = p.textContent.split(" ");
          let tempText = "";
          for (let w of words) {
            const test = tempText + " " + w;
            measureDiv.innerHTML = currentHTML + `<p>${test}</p>`;
            if (measureDiv.scrollHeight > pageHeightLimit) {
              generatedPages.push(currentHTML + `<p>${tempText}</p>`);
              currentHTML = "";
              tempText = w; // start new page with remaining words
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
