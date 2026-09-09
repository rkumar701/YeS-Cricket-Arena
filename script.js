document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("clickBtn");
  const message = document.getElementById("message");

  button.addEventListener("click", () => {
    message.textContent = "JavaScript is working! Your website is fully interactive.";
  });
});
