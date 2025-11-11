// This is the popup script for your extension
document.addEventListener('DOMContentLoaded', () => {
  const testButton = document.getElementById('testButton');
  
  if (testButton) {
    testButton.addEventListener('click', () => {
      console.log('Test button clicked!');
      alert('Extension is working!');
    });
  }
});
