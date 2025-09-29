// script.js
let totalScore = 0;
let progress = 0;
let direction = 1; // 1 = moving right, -1 = moving left
let speed = 5;
let interval;

// explicit DOM refs (avoid relying on implicit globals)
const progressBar = document.getElementById("progressBar");
const stopBtn = document.getElementById("stopBtn");
const result = document.getElementById("result");
const nextBtn = document.getElementById("nextBtn");
const targetZone = document.getElementById("targetZone");
const stage1 = document.getElementById('stage1');
const stage2 = document.getElementById('stage2');
const stage3 = document.getElementById('stage3');
const stage4 = document.getElementById('stage4');
const grindBtn = document.getElementById('grindBtn');
const grindFill = document.getElementById('grindFill');
const grindResult = document.getElementById('grindResult');
const nextBtn2 = document.getElementById('nextBtn2');
const nextBtn3 = document.getElementById('nextBtn3');
const nextBtn4 = document.getElementById('nextBtn4');
const tempBar = document.getElementById('tempBar');
const timerDisplay = document.getElementById('timerDisplay');
const tempResult = document.getElementById('tempResult');
const finalScoreEl = document.getElementById('finalScore');
const scoreRoastEl = document.getElementById('scoreRoast');
const scoreGrindEl = document.getElementById('scoreGrind');
const scoreTemperEl = document.getElementById('scoreTemper');
const scoreMoldEl = document.getElementById('scoreMold');
const restartBtn = document.getElementById('restartBtn');
const safeZoneEl = document.getElementById('safeZone');

function highlightStep(stepNumber) {
  // clear all highlights
  document.querySelectorAll(".info-step").forEach(step => {
    step.classList.remove("active");
  });
  // add highlight to the current step
  const currentStep = document.getElementById("step" + stepNumber);
  if (currentStep) {
    currentStep.classList.add("active");
    currentStep.scrollIntoView({ behavior: "smooth", block: "nearest" }); // optional
  }
}


// Start moving the bar
function startRoast() {
  interval = setInterval(() => {
    progress += direction * speed;
    const roastWidth = document.querySelector('.roast-container').offsetWidth;
    const maxProgress = roastWidth - progressBar.offsetWidth;
    if (progress <= 0 || progress >= maxProgress) {
      direction *= -1; // bounce
    }
    progressBar.style.left = progress + "px";
  }, 16);
}

// per-stage scores
let roastScore = 0;
let grindScore = 0;
let temperScore = 0;
let moldScore = 0;

stopBtn.addEventListener("click", () => {
  clearInterval(interval);
  const barLeft = progress + progressBar.offsetWidth / 2; // center of moving bar
  const containerWidth = document.querySelector(".roast-container").offsetWidth;

  // distances from center
  const center = containerWidth / 2;
  const distance = Math.abs(barLeft - center);

  
  if (distance < 15) {
    result.textContent = "✅ Perfect roast! (+100 points)";
    result.style.color = "green";
    roastScore = 100;
    totalScore += 100;
  } else if (distance < 40) {
    result.textContent = "😐 Decent roast! (+50 points)";
    result.style.color = "orange";
    roastScore = 50;
    totalScore += 50;
  } else {
    result.textContent = "❌ Burned or undercooked! (+10 points)";
    result.style.color = "red";
    roastScore = 10;
    totalScore += 10;
  }

  // update per-stage display if present
  if (scoreRoastEl) scoreRoastEl.textContent = 'Roast: ' + roastScore;

  stopBtn.style.display = "none";
  nextBtn.style.display = "inline-block";
});

window.onload = () => {
  highlightStep(1);
  startRoast();
};

// ===== Stage 2: Grinding =====
const grindTimerDisplay = document.getElementById("grindTimer");
let grindTimer;
let grindTimeLeft = 5; // seconds
let grindProgress = 0;

function startGrindTimer() {
  grindTimeLeft = 5;
  grindProgress = 0;
  grindTimerDisplay.textContent = "Time left: " + grindTimeLeft;
  grindResult.textContent = "";
  grindFill.style.width = "0";
  nextBtn2.style.display = "none";

  clearInterval(grindTimer);
  grindTimer = setInterval(() => {
    grindTimeLeft--;
    grindTimerDisplay.textContent = "Time left: " + grindTimeLeft;
    if (grindTimeLeft <= 0) {
      clearInterval(grindTimer);
      // end round
      grindBtn.disabled = true;

      // ==== scoring logic ====
      let scoreText = "";
      if (grindProgress >= 80) {
        scoreText = "✅ Perfect grind! (+100 points)";
        grindResult.style.color = "green";
        grindScore = 100;
        totalScore += 100;
      } else if (grindProgress >= 50) {
        scoreText = "⚠️ Okay grind, but could be smoother. (+50 points)";
        grindResult.style.color = "orange";
        grindScore = 50;
        totalScore += 50;
      } else {
        scoreText = "❌ Poor grind! (+20 points)";
        grindResult.style.color = "red";
        grindScore = 20;
        totalScore += 20;
      }

      grindResult.textContent = scoreText;
      if (scoreGrindEl) scoreGrindEl.textContent = 'Grind: ' + grindScore;
      nextBtn2.style.display = "inline-block";
    }
  }, 1000);
}

grindBtn.addEventListener("click", () => {
  if (grindTimeLeft > 0) {
    grindProgress += 5; // each click adds 5%
    if (grindProgress > 100) grindProgress = 100;
    grindFill.style.width = grindProgress + "%";
  }
});

// start Stage 2 when entering
nextBtn.addEventListener("click", () => {
  stage1.style.display = "none";
  stage2.style.display = "block";
  grindBtn.disabled = false;
  startGrindTimer();
  // highlight the second step in the info panel when Stage 1 finishes
  highlightStep(2);
});

nextBtn2.addEventListener("click", () => {
  stage2.style.display = "none";
  stage3.style.display = "block";
  highlightStep(3);
  startTempering();
});


// ===== Stage 3: Tempering =====
const tempControlBtn = document.getElementById("tempControlBtn");

let tempPos = 200; // start middle
let tempVelocity = 0;
let tempFallSpeed = 1; // how quickly it drifts left
let tempBoost = 12; // how much right movement per press

function startTempering() {
  tempPos = 200;
  insideSafeTime = 0;
  timeLeft = 8;
  tempResult.textContent = "";
  nextBtn3.style.display = "none";
  timerDisplay.textContent = "Time left: 8";

  // countdown
  gameTimer = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = "Time left: " + timeLeft;
    if (timeLeft <= 0) {
      clearInterval(tempInterval);
      clearInterval(gameTimer);

      // ==== scoring logic based on final bar position ====
        const barCenter = tempPos + tempBar.offsetWidth / 2;
        const containerWidth = document.getElementById("tempContainer").offsetWidth;
        const percent = (barCenter / containerWidth) * 100;

        if (percent >= 40 && percent <= 60) {
          tempResult.textContent = "✅ Perfect tempering! (+100)";
          tempResult.style.color = "green";
          temperScore = 100;
          totalScore += 100;
        } else if ((percent >= 25 && percent < 40) || (percent > 60 && percent <= 75)) {
          tempResult.textContent = "😐 Decent tempering (+50)";
          tempResult.style.color = "orange";
          temperScore = 50;
          totalScore += 50;
        } else {
          tempResult.textContent = "❌ Poor tempering! (+20)";
          tempResult.style.color = "red";
          temperScore = 20;
          totalScore += 20;
        }

      nextBtn3.style.display = "inline-block";
      if (scoreTemperEl) scoreTemperEl.textContent = 'Temper: ' + temperScore;
    }
  }, 1000);
}

// control button: hold to push right
let pushingRight = false;

tempControlBtn.addEventListener("mousedown", () => {
  pushingRight = true;
});
tempControlBtn.addEventListener("mouseup", () => {
  pushingRight = false;
});
tempControlBtn.addEventListener("mouseleave", () => {
  pushingRight = false; // stop if they move cursor away
});

// game loop adjustment inside startTempering()
tempInterval = setInterval(() => {
  // natural drift left
  tempPos -= tempFallSpeed;

  // if holding button, push right
  if (pushingRight) {
    tempPos += 3; // adjust for balance
  }

  // clamp position
  if (tempPos < 0) tempPos = 0;
  // compute dynamic max for temp bar based on container width
  const tempWidth = document.getElementById('tempContainer').offsetWidth;
  const maxTemp = tempWidth - tempBar.offsetWidth;
  if (tempPos > maxTemp) tempPos = maxTemp;

  // move the bar
  tempBar.style.left = tempPos + "px";

  // check safe zone overlap
  const barLeft = tempPos;
  const barRight = barLeft + tempBar.offsetWidth;

  // compute safe zone boundaries; prefer a DOM element named `safeZone` if present,
  // otherwise fall back to a centered percentage zone inside the temp container
  const tempContainerEl = document.getElementById('tempContainer');
  let zoneLeft, zoneRight;
  if (typeof safeZone !== 'undefined' && safeZone) {
    zoneLeft = safeZone.offsetLeft;
    zoneRight = zoneLeft + safeZone.offsetWidth;
  } else if (tempContainerEl) {
    // fallback: center 20% window
    const cw = tempContainerEl.offsetWidth;
    zoneLeft = cw * 0.4;
    zoneRight = cw * 0.6;
  } else {
    // last resort: tiny zone near middle
    zoneLeft = 100;
    zoneRight = 140;
  }

  if (barRight > zoneLeft && barLeft < zoneRight) {
    insideSafeTime += 0.016; // ~per frame
  }
}, 16);

// Spacebar stops the roast when stage1 is visible
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    // only trigger if stage1 is currently visible
    if (stage1 && getComputedStyle(stage1).display !== 'none') {
      // simulate stop button press
      stopBtn.click();
      e.preventDefault();
    }
  }
});

nextBtn3.addEventListener("click", () => {
  stage3.style.display = "none";
  stage4.style.display = "block";
  highlightStep(4);
  startMolding();
});


// ===== Stage 4: Molding =====
// `stage4` and `nextBtn4` are declared above with other DOM refs.
let blobs = document.querySelectorAll(".blob");
let slots = document.querySelectorAll(".moldSlot");
const moldResult = document.getElementById("moldResult");
const moldTimerEl = document.getElementById('moldTimer');
let moldTimer = null; // hoisted timer so we can clear between rounds

// store original locations so wrong drops can return blobs
const blobOriginal = new WeakMap();

let filledSlots = 0;
function startMolding() {
  // make NodeList fresh (in case DOM changed)
  // clear any existing mold timer from a previous run
  if (moldTimer) {
    clearInterval(moldTimer);
    moldTimer = null;
  }
  blobs = document.querySelectorAll('.blob');
  slots = document.querySelectorAll('.moldSlot');

  // reset state
  filledSlots = 0;
  moldScore = 0;
  blobs.forEach(b => b.classList.remove('used'));
  slots.forEach(s => { s.classList.remove('filled','expected-1','expected-2','expected-3'); s.textContent = ''; });
  moldResult.textContent = '';
  nextBtn4.style.display = 'none';

  // assign random types to blobs and expectations to slots
  const types = ['square','round','heart'];
  const emojiMap = {
    'square': '◻️',
    'round': '⚪️',
    'heart': '❤️'
  };
  // attach data-type to blobs but render only the chocolate as the draggable item
  blobs.forEach((blob, i) => {
    const t = types[i % types.length];
    blob.dataset.type = t;
    // render only the chocolate in the draggable element so the type hint stays put in the slots
    blob.innerHTML = `<span class="choc">🍫</span>`;
    blob.title = t;
    blob.setAttribute('draggable','true');
    // remove previously attached listeners (safe on repeated plays)
    blob.removeEventListener('dragstart', onBlobDragStart);
    blob.removeEventListener('dragend', onBlobDragEnd);
    blob.addEventListener('dragstart', onBlobDragStart);
    blob.addEventListener('dragend', onBlobDragEnd);
    // remember the original parent and index for returning later
    blobOriginal.set(blob, { parent: blob.parentElement, html: blob.parentElement.innerHTML });
  });

  // helper to rebind events when blobs are recreated
  function bindBlobHandlers() {
    blobs = document.querySelectorAll('.blob');
    blobs.forEach(b => {
      b.removeEventListener('dragstart', onBlobDragStart);
      b.removeEventListener('dragend', onBlobDragEnd);
      b.addEventListener('dragstart', onBlobDragStart);
      b.addEventListener('dragend', onBlobDragEnd);
      b.setAttribute('draggable','true');
      b.classList.remove('used');
    });
  }

  // call once to ensure handlers are present
  bindBlobHandlers();

  // assign expected types to slots - give each slot one unique type (shuffle types)
  const slotLabels = document.querySelectorAll('.slotLabel');
  // shuffle a copy of types to ensure each appears once per round
  const shuffled = types.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  slots.forEach((slot, i) => {
    const exp = shuffled[i % shuffled.length];
    slot.dataset.expected = exp;
    slot.classList.add('expected-' + (Math.floor(Math.random()*3)+1));
    // only render the placeholder inside the slot; place the hint emoji and text under the slot
    slot.innerHTML = `<span class="placeholder">&nbsp;</span>`;
    // update the human-readable label under the slot (emoji + text)
    if (slotLabels && slotLabels[i]) {
      slotLabels[i].innerHTML = `<div class="typeHint">${emojiMap[exp] || ''}</div><div class="labelText">${exp.charAt(0).toUpperCase() + exp.slice(1)}</div>`;
    }

    // remove and re-add listeners to avoid duplicates when restarting
    slot.removeEventListener('dragover', slot._dragOver);
    slot.removeEventListener('dragleave', slot._dragLeave);
    slot.removeEventListener('drop', slot._dropHandler);

    slot._dragOver = function(e) { e.preventDefault(); slot.style.background = '#ddd'; };
    slot._dragLeave = function() { if (!slot.classList.contains('filled')) slot.style.background = '#eee'; };
    slot._dropHandler = onSlotDrop;

    slot.addEventListener('dragover', slot._dragOver);
    slot.addEventListener('dragleave', slot._dragLeave);
    slot.addEventListener('drop', slot._dropHandler);
  });

  // start mold timer
  let moldTimeLeft = 12;
  if (moldTimerEl) moldTimerEl.textContent = 'Time left: ' + moldTimeLeft;
  moldTimer = setInterval(() => {
    moldTimeLeft--;
    if (moldTimerEl) moldTimerEl.textContent = 'Time left: ' + moldTimeLeft;
    if (moldTimeLeft <= 0) {
  clearInterval(moldTimer);
  moldTimer = null;
      // end round: score based on filledSlots
      const full = filledSlots;
      if (full === slots.length) {
        moldResult.textContent = '✅ Chocolates molded!';
        moldResult.style.color = 'green';
        // time bonus
        moldScore += 30;
      } else if (full >= Math.floor(slots.length/2)) {
        moldResult.textContent = '⚠️ Some molds left empty.';
        moldResult.style.color = 'orange';
      } else {
        moldResult.textContent = '❌ Not enough chocolates molded.';
        moldResult.style.color = 'red';
      }
      totalScore += moldScore;
      if (scoreMoldEl) scoreMoldEl.textContent = 'Mold: ' + moldScore;
      nextBtn4.style.display = 'inline-block';
    }
  }, 1000);
}

function onBlobDragStart(e) {
  e.dataTransfer.setData('text/plain', e.target.dataset.type || '');
  e.target.classList.add('dragging');
}

function onBlobDragEnd(e) {
  e.target.classList.remove('dragging');
}

function onSlotDrop(e) {
  e.preventDefault();
  const type = e.dataTransfer.getData('text/plain');
  const slot = e.currentTarget;
  // find the dragging blob to mark it used
  const dragging = document.querySelector('.dragging');
  if (!slot.classList.contains('filled') && dragging) {
    // scoring: exact match = 50, different = 10
    const expected = slot.dataset.expected;
    if (type && expected && type === expected) {
      moldScore += 50;
      // replace placeholder with chocolate but keep hint visible
      const placeholder = slot.querySelector('.placeholder');
      if (placeholder) placeholder.textContent = '🍫';
      slot.classList.add('filled');
      slot.classList.remove('partial');
      // remove any inline background set during dragover so CSS class can show
      slot.style.background = '';
      slot.style.color = '';
      // move the dragging element physically into the slot area (optional)
      if (dragging && dragging.parentElement) {
        // remove from its parent list so it visually disappears from the blobRow
        dragging.parentElement.removeChild(dragging);
      }
      // mark the slot as counted and mark the blob used
      dragging.classList.add('used');
      dragging.setAttribute('draggable','false');
      filledSlots++;
    } else {
      moldScore += 10;
      // clear any placeholder change for wrong drops (we don't fill the slot)
      const placeholder = slot.querySelector('.placeholder');
      if (placeholder) placeholder.textContent = '\u00A0';
      slot.classList.remove('filled');
      slot.classList.add('partial');
      // clear inline background so the partial class background is visible
      slot.style.background = '';
      slot.style.color = '';
      // wrong placement: flash the slot and return the blob to its original spot
      slot.classList.add('flash-wrong');
      setTimeout(() => slot.classList.remove('flash-wrong'), 700);
      if (dragging) {
        // ensure it remains draggable
        dragging.classList.remove('dragging');
        dragging.classList.remove('used');
        dragging.setAttribute('draggable','true');
        // return to original parent if available
        const orig = blobOriginal.get(dragging);
        if (orig && orig.parent) {
          try {
            if (!orig.parent.contains(dragging)) {
              orig.parent.appendChild(dragging);
            }
            // rebind the handlers for the returned blob
            dragging.removeEventListener('dragstart', onBlobDragStart);
            dragging.removeEventListener('dragend', onBlobDragEnd);
            dragging.addEventListener('dragstart', onBlobDragStart);
            dragging.addEventListener('dragend', onBlobDragEnd);
          } catch (err) {
            // fallback: do nothing if DOM move fails
            console.warn('Could not return blob to original parent', err);
          }
        }
      }
    }
  }
}
nextBtn4.addEventListener("click", () => {
  stage4.style.display = "none";
  finalScreen.style.display = "block";


  // display final score on the final screen
  if (finalScoreEl) {
    finalScoreEl.textContent = "Final Score: " + totalScore;
  }
  if (scoreRoastEl) scoreRoastEl.textContent = 'Roast: ' + roastScore;
  if (scoreGrindEl) scoreGrindEl.textContent = 'Grind: ' + grindScore;
  if (scoreTemperEl) scoreTemperEl.textContent = 'Temper: ' + temperScore;
  if (scoreMoldEl) scoreMoldEl.textContent = 'Mold: ' + moldScore;
});
// ===== Final Screen =====

// Restart button
restartBtn.addEventListener("click", () => {
  location.reload();
});
