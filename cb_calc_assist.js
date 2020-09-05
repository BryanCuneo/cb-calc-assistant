/* Clanboss Calculator Assistant - Save, share, and import speedtunes

  A small addon for https://www.deadwoodjedi.com/clan-boss-speed-calculator.
  Enables the exporting and importing of JSON files to save and share your
  speedtunes for Raid: Shadow Legends.

  Tested in Firefox 80.0 and Chrome 85.0.4183.83.

  Not associated with DeadwoodJedi or Raid.

  Author: Bryan Cuneo <bryan.cuneo@gmail.com>
  GitHub: https://github.com/BryanCuneo/cb-calc-assistant
  License: MPL  2.0
*/

// Variables to hold all the calculator's input elements
var difficulty
var champion_selectors
var speed_sets
var base_speeds
var total_speeds
var lore_of_steel
var a2_cooldowns
var a3_cooldowns
var a4_cooldowns
var a2_delays
var a3_delays
var a4_delays

// The dropdowns require us to explicitly trigger their on-change events
function triggerChangeEvent(element) {
  if ("createEvent" in document) {
    var evt = document.createEvent("HTMLEvents");
    evt.initEvent("change", false, true);
    element.dispatchEvent(evt);
  }
  else
    element.fireEvent("onchange");
}

// Insert a DOM node, newNode, immediately after referenceNode
function insertAfter(newNode, referenceNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

// Grab all the elements we want to fill
function getCalcInputElements() {
  difficulty = document.getElementById('difficulty')
  speed_aura_bonus = document.getElementById('speed_aura_bonus')
  // Most of the inputs don't have an ID
  champion_selectors = document.getElementsByClassName('champion_select')
  speed_sets = document.getElementsByClassName('speed_sets')
  base_speeds = document.getElementsByClassName('base_speed')
  total_speeds = document.getElementsByClassName('total_speed')
  lore_of_steel = document.getElementsByClassName('lore_steel')

  a2_cooldowns = document.getElementsByClassName('cooldown_2')
  a3_cooldowns = document.getElementsByClassName('cooldown_3')
  a4_cooldowns = document.getElementsByClassName('cooldown_4')

  a2_delays = document.getElementsByClassName('delay_2')
  a3_delays = document.getElementsByClassName('delay_3')
  a4_delays = document.getElementsByClassName('delay_4')
}

// Fill the calculator form fields with the values from the uploaded file
function importJson() {
  // Load the file from the user
  var speedTuneJson;
  const file = document.getElementById('speedtuneImportInput').files[0]
  const fr = new FileReader()

  fr.addEventListener("load", e => {
    speedTuneJson = JSON.parse(fr.result)
     //console.log(e.target.result, speedTuneJson)
     fillCalculator(speedTuneJson)
  })
  fr.readAsText(file)
}

// Populate the calculator input fields with data from speedTuneJson
function fillCalculator(speedTuneJson) {
  // Get a list of all names in the champion selector dropdown
  var preset_champion_names = new Array();
  for (let option of champion_selectors[0].options) {
    preset_champion_names.push(option.value)
  }
  
  // Update the two elements with IDs
  difficulty.value = speedTuneJson.difficulty
  triggerChangeEvent(difficulty)
  speed_aura_bonus.value = speedTuneJson.speed_aura_bonus

  // For each champion, fill all the inputs
  for (var i = 0; i < champion_selectors.length; i++) {
    var champion = speedTuneJson.champions[i]

    // Update the Lore of Steel dropdown
    if (champion.lore_of_steel === 'Yes') {
      lore_of_steel[i].value = 'Yes'
    } else {
      lore_of_steel[i].value = 'No'
    }
    triggerChangeEvent(lore_of_steel[i])

    // Update the plaintext boxes
    speed_sets[i].value = champion.speed_sets
    base_speeds[i].value = champion.base_speed
    total_speeds[i].value = champion.total_speed
    // For the cooldowns/delays, values must be null or a number
    a2_cooldowns[i].value = champion.a2.cooldown || null
    a3_cooldowns[i].value = champion.a3.cooldown || null
    a4_cooldowns[i].value = champion.a4.cooldown || null
    a2_delays[i].value = champion.a2.delay || null
    a3_delays[i].value = champion.a3.delay || null
    a4_delays[i].value = champion.a4.delay || null

    // Update the name dropdown boxes.
    // Do this last so that the Salculated Speed will update properly
    if (champion.name != "") {
      if (!preset_champion_names.includes(champion.name)) {
        // If the name isn't already an option, the text box will be blank. So we add the option
        var option = document.createElement('option')
        option.text = option.value = champion.name
        champion_selectors[i].add(option)
      }
      champion_selectors[i].value = champion.name
      triggerChangeEvent(champion_selectors[i])
    }
  }
}

// Export the calculator fields' current values to a JSON file
function exportSpeedTune() {
  var jsonData = {}

  jsonData['difficulty'] = difficulty.value
  jsonData['speed_aura_bonus'] = speed_aura_bonus.value
  jsonData['champions'] = []

  for (var i = 0; i < champion_selectors.length; i++) {
    var champion = {}

    champion.name = champion_selectors[i].value
    champion.speed_sets = speed_sets[i].value
    champion.base_speed = base_speeds[i].value
    champion.total_speed = total_speeds[i].value
    champion.lore_of_steel = lore_of_steel[i].value
    
    champion.a2 = {}
    champion.a2.cooldown = a2_cooldowns[i].value
    champion.a2.delay = a2_delays[i].value

    champion.a3 = {}
    champion.a3.cooldown = a3_cooldowns[i].value
    champion.a3.delay = a3_delays[i].value    
    
    champion.a4 = {}
    champion.a4.cooldown = a4_cooldowns[i].value
    champion.a4.delay = a4_delays[i].value

    jsonData['champions'].push(champion)
  }

  console.log(jsonData)

  // Trigger the download link's click event to open the Save As dialog
  var downloadAnchor = document.createElement('a')
  var jsonString = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(jsonData));
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute('download', 'speedtune.json');
  downloadAnchor.click();
}

// Set the calculator fields back to their default values
function resetCalculator() {
  difficulty.value = 'Ultimate Nightmare'
  triggerChangeEvent(difficulty)

  speed_aura_bonus.value = null

  for (var i = 0; i < champion_selectors.length; i++) {
    lore_of_steel[i].value = 'No'
    triggerChangeEvent(lore_of_steel[i])

    speed_sets[i].value = null
    base_speeds[i].value = null
    total_speeds[i].value = null
    a2_cooldowns[i].value = null
    a3_cooldowns[i].value = null
    a4_cooldowns[i].value = null
    a2_delays[i].value = null
    a3_delays[i].value = null
    a4_delays[i].value = null

    champion_selectors[i].value = 'Champion_' + i+1
    triggerChangeEvent(champion_selectors[i])
  }
}

// Grab the calculator input elements
getCalcInputElements()

// Create the Import button using an invisible <input type='file'> and visible <inpet type='button'>
var importInput = document.createElement('input')
importInput.type = 'File'
importInput.id = 'speedtuneImportInput'
importInput.accept = '.json'
importInput.style.display = 'none'
importInput.addEventListener('change', importJson, false)

var importButton = document.createElement('input')
importButton.type = 'Button'
importButton.id = 'speedtuneImportButton'
importButton.value = 'Import'
importButton.addEventListener('click', e => {importInput.click() }, false)

//Create the Export button
var exportButton = document.createElement('input')
exportButton.type = 'Button'
exportButton.id = 'speedTuneExportButton'
exportButton.value = 'Export'
exportButton.addEventListener('click', exportSpeedTune, false)

// Create the Reset button
var resetButton = document.createElement('input')
resetButton.type = 'Button'
resetButton.id = 'resetCalculatorButton'
resetButton.value = 'Reset'
resetButton.addEventListener('click', resetCalculator, false)

// Create a 'link' to download the export file
var downloadAnchor = document.createElement('a')
downloadAnchor.id = 'downloadAnchor'
downloadAnchor.display = 'none'

// Insert the new elements below the title div
var titleDiv = document.querySelector('div.calculator div.title')
insertAfter(importInput, titleDiv)
insertAfter(importButton, importInput)
insertAfter(exportButton, importButton)
insertAfter(resetButton, exportButton)
insertAfter(downloadAnchor, resetButton)