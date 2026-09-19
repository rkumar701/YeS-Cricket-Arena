document.addEventListener("DOMContentLoaded", () => {

  /* =====================================================
     MOBILE NAVIGATION
  ====================================================== */

  const mobileMenuButton =
    document.querySelector(".mobile-menu-button");

  const mobileNav =
    document.querySelector(".mobile-nav");


  if (mobileMenuButton && mobileNav) {

    mobileMenuButton.addEventListener("click", () => {

      const isOpen =
        mobileNav.classList.toggle("open");

      mobileMenuButton.setAttribute(
        "aria-expanded",
        String(isOpen)
      );

    });


    mobileNav
      .querySelectorAll("a")
      .forEach(link => {

        link.addEventListener("click", () => {

          mobileNav.classList.remove("open");

          mobileMenuButton.setAttribute(
            "aria-expanded",
            "false"
          );

        });

      });

  }


  /* =====================================================
     HEADER SCROLL EFFECT
  ====================================================== */

  const header =
    document.querySelector(".site-header");


  const updateHeader = () => {

    if (!header) return;

    if (window.scrollY > 40) {

      header.classList.add("scrolled");

    } else {

      header.classList.remove("scrolled");

    }

  };


  window.addEventListener(
    "scroll",
    updateHeader,
    { passive: true }
  );

  updateHeader();


  /* =====================================================
     ACTIVE NAVIGATION
  ====================================================== */

  const sections =
    document.querySelectorAll(
      "#facilities, #experience, #matchLab, #contact"
    );

  const navLinks =
    document.querySelectorAll(".main-nav a");


  if ("IntersectionObserver" in window) {

    const observer =
      new IntersectionObserver(
        entries => {

          entries.forEach(entry => {

            if (!entry.isIntersecting) return;

            navLinks.forEach(link => {

              link.classList.toggle(
                "active",
                link.getAttribute("href") ===
                `#${entry.target.id}`
              );

            });

          });

        },
        {
          rootMargin: "-40% 0px -50%"
        }
      );


    sections.forEach(section => {
      observer.observe(section);
    });

  }


  /* =====================================================
     CONTACT COPY
  ====================================================== */

  function copyTextFallback(text) {

    const helper =
      document.createElement("textarea");

    helper.value = text;

    helper.style.position = "fixed";
    helper.style.opacity = "0";

    document.body.appendChild(helper);

    helper.select();

    try {
      document.execCommand("copy");
    } catch (error) {
      console.warn("Copy failed:", error);
    }

    helper.remove();

  }


  async function copyText(text) {

    if (
      navigator.clipboard &&
      window.isSecureContext
    ) {

      try {

        await navigator.clipboard.writeText(text);

        return;

      } catch (error) {

        console.warn(
          "Clipboard API failed:",
          error
        );

      }

    }

    copyTextFallback(text);

  }


  document
    .querySelectorAll(".copy-contact")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const text =
            button.dataset.copy;

          if (!text) return;

          copyText(text);

          button.classList.add("copied");

          const label =
            button.querySelector(".copy-label");

          if (label) {
            label.textContent = "Copied";
          }

          setTimeout(() => {

            button.classList.remove("copied");

            if (label) {
              label.textContent = "Copy";
            }

          }, 1600);

        }
      );

    });


  /* =====================================================
     MATCH CENTRE
  ====================================================== */

  let runs = 0;
  let wickets = 0;
  let balls = 0;

  let targetRate = 8;

  let mode = "BATTING";

  let challengeActive = false;
  let challengeStarted = false;

  let timeLeft = 20;

  let streak = 0;

  let rollLocked = false;

  let challengeTimer;


  const challengeButton =
    document.getElementById("challengeButton");

  const timeDisplay =
    document.getElementById("timeDisplay");

  const labBestScore =
    document.getElementById("bestScoreDisplay");

  const runsDisplay =
    document.getElementById("runsDisplay");

  const wicketsDisplay =
    document.getElementById("wicketsDisplay");

  const oversDisplay =
    document.getElementById("oversDisplay");

  const runRateDisplay =
    document.getElementById("runRateDisplay");

  const targetDisplay =
    document.getElementById("targetDisplay");

  const targetOutput =
    document.getElementById("targetRateOutput");

  const labNote =
    document.getElementById("labNote");

  const rollButton =
    document.getElementById("rollDelivery");

  const diceFace =
    document.getElementById("diceFace");

  const rollLabel =
    document.getElementById("rollLabel");

  const scoreboard =
    document.querySelector(".scoreboard");

  const resultToast =
    document.getElementById("resultToast");

  const resultModal =
    document.getElementById("resultModal");

  const resultTitle =
    document.getElementById("resultTitle");

  const resultMessage =
    document.getElementById("resultMessage");

  const resultKicker =
    document.getElementById("resultKicker");

  const bestScoreUnit =
    document.getElementById("bestScoreUnit");


  /* =====================================================
     LOCAL STORAGE
  ====================================================== */

  const storage = {

    get(key) {

      try {

        return localStorage.getItem(key);

      } catch {

        return null;

      }

    },

    set(key, value) {

      try {

        localStorage.setItem(
          key,
          value
        );

      } catch {

        /* Storage may be blocked. */

      }

    }

  };


  /* =====================================================
     SCOREBOARD UPDATE
  ====================================================== */

  function updateScoreboard() {

    if (!runsDisplay) return;


    runsDisplay.textContent =
      runs;

    wicketsDisplay.textContent =
      wickets;


    oversDisplay.textContent =
      `${Math.floor(balls / 6)}.${balls % 6}`;


    runRateDisplay.textContent =
      balls
        ? (runs / (balls / 6)).toFixed(2)
        : "0.00";


    targetDisplay.textContent =
      mode === "BATTING"
        ? targetRate.toFixed(1)
        : "3";


    targetOutput.value =
      targetRate.toFixed(1);


    document
      .querySelectorAll("#overDots i")
      .forEach((dot, index) => {

        dot.classList.toggle(
          "active",
          index < balls % 6 ||
          (
            balls > 0 &&
            balls % 6 === 0
          )
        );

      });


    if (
      challengeActive &&
      (
        (
          mode === "BATTING" &&
          runs >= 50
        ) ||
        (
          mode === "BOWLING" &&
          wickets >= 3
        )
      )
    ) {

      finishChallenge(true);

    }

  }


  /* =====================================================
     FINISH CHALLENGE
  ====================================================== */

  function finishChallenge(won) {

    if (!challengeStarted) return;


    challengeActive = false;
    challengeStarted = false;

    challengeButton.disabled = false;

    rollLocked = false;

    rollButton.disabled = true;

    rollButton.classList.add(
      "is-hidden"
    );


    clearInterval(challengeTimer);


    const bestKey =
      mode === "BATTING"
        ? "yesArenaBestBatting"
        : "yesArenaBestBowling";


    const score =
      mode === "BATTING"
        ? runs
        : wickets;


    const best =
      Math.max(
        score,
        Number(
          storage.get(bestKey) || 0
        )
      );


    storage.set(
      bestKey,
      best
    );


    labBestScore.textContent =
      best;


    challengeButton.innerHTML =
      won
        ? 'You Won — Play Again <span>↗</span>'
        : 'Try Again <span>↗</span>';


    if (won) {

      labNote.textContent =
        mode === "BATTING"
          ? `Target beaten with a ${streak} shot streak. Nice innings!`
          : `Three wickets taken. The bowler wins this spell!`;

    } else {

      labNote.textContent =
        mode === "BATTING"
          ? `Time's up. You scored ${runs}. Give it another go.`
          : `Time's up. You took ${wickets} wickets. Try another spell.`;

    }


    resultKicker.textContent =
      won
        ? "Challenge complete"
        : "Final delivery";


    resultTitle.textContent =
      won
        ? (
            mode === "BATTING"
              ? "You got there."
              : "Bowling masterclass."
          )
        : "Close one.";


    resultMessage.textContent =
      won
        ? (
            mode === "BATTING"
              ? `You chased 50 runs with a ${streak} delivery streak.`
              : `You found ${wickets} wickets before the clock ran out.`
          )
        : (
            mode === "BATTING"
              ? `You finished on ${runs} runs. The real pitch is waiting.`
              : `You finished with ${wickets} wickets. The real pitch is waiting.`
          );


    resultModal.classList.add("open");

    resultModal.setAttribute(
      "aria-hidden",
      "false"
    );

  }


  /* =====================================================
     ROLL DELIVERY
  ====================================================== */

  if (rollButton) {

    rollButton.addEventListener(
      "click",
      () => {

        if (
          rollLocked ||
          !challengeActive
        ) return;


        rollLocked = true;

        rollButton.disabled = true;


        setTimeout(() => {

          if (challengeActive) {

            rollLocked = false;

            rollButton.disabled = false;

          }

        }, 550);


        const outcomes = [
          1,
          1,
          1,
          4,
          4,
          6,
          6,
          "W"
        ];


        const outcome =
          outcomes[
            Math.floor(
              Math.random() *
              outcomes.length
            )
          ];


        const diceFaces = {

          1: "1",
          4: "4",
          6: "6",
          W: "X"

        };


        diceFace.textContent =
          diceFaces[outcome];


        rollButton.classList.remove(
          "rolling"
        );


        void rollButton.offsetWidth;


        rollButton.classList.add(
          "rolling"
        );


        scoreboard.classList.remove(
          "celebrate",
          "disappoint",
          "boundary-four",
          "boundary-six"
        );


        resultToast.classList.remove(
          "show",
          "disappoint",
          "boundary-four",
          "boundary-six"
        );


        void scoreboard.offsetWidth;


        balls += 1;


        if (outcome === "W") {

          wickets =
            Math.min(
              10,
              wickets + 1
            );

          streak = 0;


          scoreboard.classList.add(
            "disappoint"
          );


          resultToast.classList.add(
            "show",
            "disappoint"
          );


          resultToast.textContent =
            "WICKET!";


          labNote.textContent =
            "WICKET! The bowler wins that delivery.";

        } else {

          runs += outcome;

          streak += 1;


          if (
            outcome === 4 ||
            outcome === 6
          ) {

            const boundaryClass =
              outcome === 6
                ? "boundary-six"
                : "boundary-four";


            scoreboard.classList.add(
              "celebrate",
              boundaryClass
            );


            resultToast.classList.add(
              "show",
              boundaryClass
            );


            resultToast.textContent =
              outcome === 6
                ? "SIX!"
                : "FOUR!";

          }


          labNote.textContent =
            `${outcome} runs! ${streak} delivery streak. Keep your eye on the ball.`;

        }


        updateScoreboard();

      }
    );

  }


  /* =====================================================
     RESET
  ====================================================== */

  const resetButton =
    document.getElementById(
      "resetScore"
    );


  if (resetButton) {

    resetButton.addEventListener(
      "click",
      () => {

        runs = 0;

        wickets = 0;

        balls = 0;

        streak = 0;

        challengeStarted = false;


        if (challengeActive) {

          challengeActive = false;

          clearInterval(
            challengeTimer
          );

        }


        rollLocked = false;

        rollButton.disabled = true;

        rollButton.classList.add(
          "is-hidden"
        );

        rollButton.classList.remove(
          "batting-action",
          "bowling-action"
        );


        challengeButton.disabled = false;


        scoreboard.classList.remove(
          "celebrate",
          "disappoint",
          "boundary-four",
          "boundary-six"
        );


        resultToast.classList.remove(
          "show",
          "disappoint",
          "boundary-four",
          "boundary-six"
        );


        resultToast.textContent = "";


        resultModal.classList.remove(
          "open"
        );


        resultModal.setAttribute(
          "aria-hidden",
          "true"
        );


        timeLeft = 20;

        timeDisplay.textContent =
          "20";


        diceFace.textContent =
          "5";


        diceFace.classList.remove(
          "bat-icon"
        );


        rollLabel.textContent =
          "Play the shot";


        challengeButton.innerHTML =
          'Start Challenge <span>↗</span>';


        labNote.textContent =
          "Start a challenge, then roll each delivery.";


        updateScoreboard();

      }
    );

  }


  /* =====================================================
     TARGET RATE
  ====================================================== */

  const targetRateInput =
    document.getElementById(
      "targetRate"
    );


  if (targetRateInput) {

    targetRateInput.addEventListener(
      "input",
      event => {

        targetRate =
          Number(
            event.target.value
          );

        updateScoreboard();

      }
    );

  }


  /* =====================================================
     MODE SWITCH
  ====================================================== */

  document
    .querySelectorAll(".mode-choice")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          document
            .querySelectorAll(
              ".mode-choice"
            )
            .forEach(choice => {

              choice.classList.toggle(
                "active",
                choice === button
              );

            });


          mode =
            button.dataset.mode;


          document.getElementById(
            "inningsMode"
          ).textContent =
            mode;


          document.getElementById(
            "challengeLabel"
          ).textContent =
            mode === "BATTING"
              ? "Beat the bowler"
              : "Find the wickets";


          document.getElementById(
            "challengeTarget"
          ).textContent =
            mode === "BATTING"
              ? "50"
              : "3";


          document.getElementById(
            "challengeUnit"
          ).textContent =
            mode === "BATTING"
              ? "runs"
              : "wickets";


          document.getElementById(
            "targetMetricLabel"
          ).textContent =
            mode === "BATTING"
              ? "Target Rate"
              : "Wicket Target";


          document.getElementById(
            "targetDisplay"
          ).textContent =
            mode === "BATTING"
              ? targetRate.toFixed(1)
              : "3";


          diceFace.classList.toggle(
            "bat-icon",
            mode === "BATTING"
          );


          rollButton.classList.toggle(
            "batting-action",
            mode === "BATTING"
          );


          rollButton.classList.toggle(
            "bowling-action",
            mode === "BOWLING"
          );


          rollLabel.textContent =
            mode === "BATTING"
              ? "Play the shot"
              : "Deliver the ball";


          bestScoreUnit.textContent =
            mode === "BATTING"
              ? "runs"
              : "wickets";


          labBestScore.textContent =
            storage.get(
              mode === "BATTING"
                ? "yesArenaBestBatting"
                : "yesArenaBestBowling"
            ) || "0";


          labNote.textContent =
            mode === "BATTING"
              ? "Chase 50 runs before the clock reaches zero."
              : "Take 3 wickets before the clock reaches zero.";

        }
      );

    });


  /* =====================================================
     START CHALLENGE
  ====================================================== */

  if (challengeButton) {

    challengeButton.addEventListener(
      "click",
      () => {

        if (challengeActive) return;


        runs = 0;

        wickets = 0;

        balls = 0;

        streak = 0;

        timeLeft = 20;


        timeDisplay.textContent =
          "20";


        challengeActive = true;

        challengeStarted = true;


        challengeButton.disabled = true;

        rollLocked = false;

        rollButton.disabled = false;

        rollButton.classList.remove(
          "is-hidden"
        );


        diceFace.classList.toggle(
          "bat-icon",
          mode === "BATTING"
        );


        rollButton.classList.toggle(
          "batting-action",
          mode === "BATTING"
        );


        rollButton.classList.toggle(
          "bowling-action",
          mode === "BOWLING"
        );


        rollLabel.textContent =
          mode === "BATTING"
            ? "Play the shot"
            : "Deliver the ball";


        challengeButton.innerHTML =
          'Challenge Live <span>●</span>';


        labNote.textContent =
          mode === "BATTING"
            ? "Chase 50 runs before the clock reaches zero. Roll the delivery."
            : "Take 3 wickets before the clock reaches zero. Roll the delivery.";


        resultModal.classList.remove(
          "open"
        );


        resultModal.setAttribute(
          "aria-hidden",
          "true"
        );


        updateScoreboard();


        clearInterval(
          challengeTimer
        );


        challengeTimer =
          setInterval(
            () => {

              timeLeft -= 1;


              timeDisplay.textContent =
                timeLeft;


              if (timeLeft <= 0) {

                finishChallenge(false);

              }

            },
            1000
          );

      }
    );

  }


  /* =====================================================
     RESULT MODAL
  ====================================================== */

  const closeResult =
    document.querySelector(
      ".result-close"
    );


  if (closeResult) {

    closeResult.addEventListener(
      "click",
      () => {

        resultModal.classList.remove(
          "open"
        );

        resultModal.setAttribute(
          "aria-hidden",
          "true"
        );

      }
    );

  }


  const resultContact =
    document.getElementById(
      "resultContact"
    );


  if (resultContact) {

    resultContact.addEventListener(
      "click",
      () => {

        resultModal.classList.remove(
          "open"
        );

        resultModal.setAttribute(
          "aria-hidden",
          "true"
        );

      }
    );

  }


  if (resultModal) {

    resultModal.addEventListener(
      "click",
      event => {

        if (
          event.target === resultModal
        ) {

          resultModal.classList.remove(
            "open"
          );

          resultModal.setAttribute(
            "aria-hidden",
            "true"
          );

        }

      }
    );

  }


  /* =====================================================
     ESCAPE KEY
  ====================================================== */

  document.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Escape" &&
        resultModal &&
        resultModal.classList.contains("open")
      ) {

        resultModal.classList.remove(
          "open"
        );

        resultModal.setAttribute(
          "aria-hidden",
          "true"
        );

      }

    }
  );


  /* =====================================================
     INITIAL STATE
  ====================================================== */

  if (labBestScore) {

    labBestScore.textContent =
      storage.get(
        "yesArenaBestBatting"
      ) || "0";

  }


  updateScoreboard();

});