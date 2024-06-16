document.addEventListener('DOMContentLoaded', () => {
    const button = document.querySelector('.button');
    const titleDiv = document.getElementById('title');
    const buttonContainer = document.getElementById('button-container');

    button.addEventListener('click', () => {
        titleDiv.style.display = 'none';
        buttonContainer.style.display = 'none';
    });
});