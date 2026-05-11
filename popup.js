const ttsToggle = document.getElementById("tts-toggle");
const ttsSpeedSection = document.getElementById("tts-speed-section");
const ttsSpeed = document.getElementById("tts-speed");
const ttsSpeedValue = document.getElementById("tts-speed-value");
const previewText = document.getElementById("preview-text");
const applyButton = document.getElementById("apply-button");
const pauseButton = document.getElementById("pause-button");
const fontSelect = document.getElementById("font-select");
const fontSizeDefault = document.getElementById("font-size-default");
const fontSizeInput = document.getElementById("font-size-input");
const lineHeightSelect = document.getElementById("line-height-select");
const wordSpacingSelect = document.getElementById("word-spacing-select");
const letterSpacingSelect = document.getElementById("letter-spacing-select");
const settingsControls = [
  // Gets every <input> and <select> in the popup and turns them into an array
  ...document.querySelectorAll("input, select")
];
const savedSettingsKey = "clearReadSettings";

let settingsAreApplied = false;
let isSpeechPaused = false;

// Show the speed slider only when Text-to-Speech is on.
function updateTextToSpeechOptions() {
  ttsSpeedSection.hidden = !ttsToggle.checked;
  pauseButton.hidden = !ttsToggle.checked;
  pauseButton.disabled = !ttsToggle.checked;
}

// Show the current speech speed next to the slider.
function updateSpeedValue() {
  ttsSpeedValue.textContent = `${Number(ttsSpeed.value).toFixed(1)}x`;
}

// The number box is only used when font size is not set to Default.
function updateFontSizeInput() {
  fontSizeInput.disabled = fontSizeDefault.checked;
}

// Gather all popup choices into one object.
function getSettings() {
  return {
    mode: document.querySelector("input[name='reading-mode']:checked").value,
    textToSpeech: ttsToggle.checked,
    speechRate: Number(ttsSpeed.value),
    fontFamily: fontSelect.value,
    useDefaultFontSize: fontSizeDefault.checked,
    fontSize: fontSizeDefault.checked ? "" : `${fontSizeInput.value}px`,
    lineHeight: lineHeightSelect.value,
    wordSpacing: wordSpacingSelect.value,
    letterSpacing: letterSpacingSelect.value
  };
}

// Save choices so they are still there when the popup opens again.
async function saveSettings() {
  await chrome.storage.local.set({
    [savedSettingsKey]: getSettings()
  });
}

// Put saved choices back into the popup controls.
async function loadSettings() {
  const savedData = await chrome.storage.local.get(savedSettingsKey);
  const settings = savedData[savedSettingsKey];

  if (!settings) {
    return;
  }

  const savedMode = document.querySelector(`input[name='reading-mode'][value='${settings.mode}']`);

  if (savedMode) {
    savedMode.checked = true;
  }
  ttsToggle.checked = settings.textToSpeech;
  ttsSpeed.value = settings.speechRate;
  fontSelect.value = settings.fontFamily;
  fontSizeDefault.checked = settings.useDefaultFontSize;
  fontSizeInput.value = parseInt(settings.fontSize, 10) || fontSizeInput.value;
  lineHeightSelect.value = settings.lineHeight;
  wordSpacingSelect.value = settings.wordSpacing;
  letterSpacingSelect.value = settings.letterSpacing;
}

// Change the preview text so users can test settings before applying them.
function updatePreview() {
  const settings = getSettings();

  previewText.style.fontFamily = settings.fontFamily;
  previewText.style.fontSize = settings.useDefaultFontSize ? "" : settings.fontSize;
  previewText.style.lineHeight = settings.lineHeight;
  previewText.style.wordSpacing = settings.wordSpacing;
  previewText.style.letterSpacing = settings.letterSpacing;
}

// Lock controls after Apply so settings do not change until Revert.
function setControlsLocked(locked) {
  settingsControls.forEach((control) => {
    control.disabled = locked;
  });

  if (!locked) {
    updateFontSizeInput();
  }

  applyButton.textContent = locked ? "Revert" : "Apply";
}

// Pause or resume 
function pauseOrResumeTTS() {
  if (!ttsToggle.checked) return;

  if (speechSynthesis.speaking && !speechSynthesis.paused) {
    speechSynthesis.pause();
    isSpeechPaused = true;
    pauseButton.textContent = "Resume";
  } 
  else if (speechSynthesis.paused) {
    speechSynthesis.resume();
    isSpeechPaused = false;
    pauseButton.textContent = "Pause";
  }
}




// Load content.js, then ask it to do one page action.
async function runPageAction(actionName, args = []) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const target = { tabId: tab.id };

  await chrome.scripting.executeScript({
    target,
    files: ["content.js"]
  });

  const results = await chrome.scripting.executeScript({
    target,
    func: (action, actionArgs) => window.clearReadContent[action](...actionArgs),
    args: [actionName, args]
  });

  return results[0].result;
}

// Apply settings, or undo them if they are already applied.
async function handleApplyButtonClick() {
  if (settingsAreApplied) {
    const didRevert = await runPageAction("revert");

    if (!didRevert) {
      return;
    }

    settingsAreApplied = false;
    speechSynthesis.cancel();
    isSpeechPaused = false;
    pauseButton.textContent = "Pause";
    setControlsLocked(false);
    return;
  }

  await saveSettings();
  const settings = getSettings();
  const result = await runPageAction("apply", [settings]);

  if (!result || !result.applied) {
    return;
  }

  settingsAreApplied = true;
  setControlsLocked(true);

  // Read the changed text aloud if Text-to-Speech is on.
if (settings.textToSpeech && result.text.trim()) {
  speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(result.text);
  utterance.rate = settings.speechRate;

  isSpeechPaused = false;
  pauseButton.textContent = "Pause";
  speechSynthesis.speak(utterance);
}

}
// Any control change updates the preview and saves the new settings.
async function handleSettingsChange() {
  updateTextToSpeechOptions();
  updateSpeedValue();
  updateFontSizeInput();
  updatePreview();
  await saveSettings();
}

// Load saved settings and set the popup to the right Apply or Revert state.
async function startPopup() {
  await loadSettings();
  await handleSettingsChange();

  pauseButton.disabled = !ttsToggle.checked;
  pauseButton.textContent = "Pause";
  isSpeechPaused = false;

  settingsAreApplied = await runPageAction("isApplied");
  setControlsLocked(settingsAreApplied);
}

settingsControls.forEach((control) => {
  control.addEventListener("input", handleSettingsChange);
  control.addEventListener("change", handleSettingsChange);
});

applyButton.addEventListener("click", handleApplyButtonClick);
pauseButton.addEventListener("click", pauseOrResumeTTS);

ttsToggle.addEventListener("change", () => {
  updateTextToSpeechOptions();

  if (!ttsToggle.checked) {
    speechSynthesis.cancel();
    isSpeechPaused = false;
    pauseButton.textContent = "Pause";
  } else {
    isSpeechPaused = false;
    pauseButton.textContent = "Pause";
  }
});

startPopup();
