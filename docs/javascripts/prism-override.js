document.addEventListener('DOMContentLoaded', function() {
    // Let Prism re-highlight all code blocks after Material loads them
    if (typeof Prism !== 'undefined') {
        Prism.highlightAll();
    }
});