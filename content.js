// This file changes the webpage. The popup calls these functions when needed.

// function expression called right away
(() => {
  // Do not set up the same helper object more than once.
  if (window.clearReadContent) {
    return;
  }

  const clearReadClass = "clearread-applied-text";
  const styleId = "clearread-style";

  // Make CSS rules only for settings the user changed from Default.
  function buildStyleRule(settings) {
    const fontFamilyRule = settings.fontFamily ? `font-family: ${settings.fontFamily} !important;` : "";
    const fontSizeRule = settings.useDefaultFontSize ? "" : `font-size: ${settings.fontSize} !important;`;
    const lineHeightRule = settings.lineHeight ? `line-height: ${settings.lineHeight} !important;` : "";
    const wordSpacingRule = settings.wordSpacing ? `word-spacing: ${settings.wordSpacing} !important;` : "";
    const letterSpacingRule = settings.letterSpacing ? `letter-spacing: ${settings.letterSpacing} !important;` : "";

    return `
      ${fontFamilyRule}
      ${fontSizeRule}
      ${lineHeightRule}
      ${wordSpacingRule}
      ${letterSpacingRule}
    `;
  }

  // Clear old styles before applying new ones.
  function removeOldClearReadStyles() {
    const existingStyle = document.getElementById(styleId);

    if (existingStyle) {
      existingStyle.remove();
    }

    document.querySelectorAll(`.${clearReadClass}`).forEach((element) => {
      element.classList.remove(clearReadClass);
    });
  }

  // Add one style tag that controls all ClearRead text changes.
  function addStyleTag(settings) {
    const styleRule = buildStyleRule(settings);
    const style = document.createElement("style");

    style.id = styleId;
    style.textContent = `
      .${clearReadClass} {
        ${styleRule}
      }

      body.${clearReadClass},
      body.${clearReadClass} * {
        ${styleRule}
      }
    `;
    document.head.appendChild(style);
  }

  // Apply the user's settings to selected text or the full page.
  function apply(settings) {
    removeOldClearReadStyles();
    addStyleTag(settings);

    // Selection mode only changes text the user highlighted.
    if (settings.mode === "selection") {
      const selection = window.getSelection();

      if (!selection || selection.rangeCount === 0 || selection.toString().trim() === "") {
        return false;
      }

      const range = selection.getRangeAt(0);
      const wrapper = document.createElement("span");

      // Put the selected text inside a span so only that text changes.
      wrapper.className = clearReadClass;
      wrapper.appendChild(range.extractContents());
      range.insertNode(wrapper);
      selection.removeAllRanges();

      return {
        applied: true,
        text: wrapper.textContent
      };
    }

    // Full Page mode changes the body and its child elements.
    document.body.classList.add(clearReadClass);

    return {
      applied: true,
      text: document.body.innerText
    };
  }

  // Remove ClearRead styles and put selected text back into the page.
  function revert() {
    const style = document.getElementById(styleId);

    if (style) {
      style.remove();
    }

    document.body.classList.remove(clearReadClass);
    document.querySelectorAll(`.${clearReadClass}`).forEach((element) => {
      element.replaceWith(...element.childNodes);
    });

    return true;
  }

  // Tell the popup if ClearRead is currently active on this page.
  function isApplied() {
    return Boolean(document.getElementById(styleId));
  }

  // Expose these functions so popup.js can call them.
  window.clearReadContent = {
    apply,
    revert,
    isApplied
  };
})();