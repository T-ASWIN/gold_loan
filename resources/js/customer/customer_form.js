document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('pledgecard_input');
    const triggerBtn = document.getElementById('upload-trigger-btn');
    const previewGrid = document.getElementById('preview-grid');

    triggerBtn?.addEventListener('click', () => fileInput.click());

    fileInput?.addEventListener('change', function () {
        previewGrid.innerHTML = '';
        const files = Array.from(this.files);

        if (files.length > 0) {
            previewGrid.classList.remove('hidden');
        }

        files.forEach((file) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const div = document.createElement('div');
                div.className = "h-24 w-24 border rounded-lg overflow-hidden";
                div.innerHTML = `<img src="${e.target.result}" class="w-full h-full object-cover">`;
                previewGrid.appendChild(div);
            };
            reader.readAsDataURL(file);
        });
    });
});