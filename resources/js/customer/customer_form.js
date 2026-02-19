document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('pledgecard_input');
    const triggerBtn = document.getElementById('upload-trigger-btn');
    const previewGrid = document.getElementById('preview-grid');
    const submitBtn = document.getElementById('submit-all');
    const form = document.querySelector('form');

    let allFiles = []; // This will store EVERY image you pick

    // 1. Handle File Selection (Appending)
    triggerBtn?.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', function() {
        const newFiles = Array.from(this.files);
        
        // Add new files to our master array
        allFiles = [...allFiles, ...newFiles];
        
        renderPreviews();
        fileInput.value = ''; // Reset input so you can pick the same file twice if needed
    });

    // 2. Render Previews with "Remove" capability
    function renderPreviews() {
        previewGrid.innerHTML = '';
        if (allFiles.length > 0) previewGrid.classList.remove('hidden');

        allFiles.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const div = document.createElement('div');
                div.className = "relative h-24 w-24 border rounded-lg overflow-hidden group";
                div.innerHTML = `
                    <img src="${e.target.result}" class="w-full h-full object-cover">
                    <button type="button" data-index="${index}" class="remove-img absolute top-0 right-0 bg-red-500 text-white text-xs p-1 opacity-0 group-hover:opacity-100">✕</button>
                `;
                previewGrid.appendChild(div);
            };
            reader.readAsDataURL(file);
        });
    }

    // 3. Remove specific image
    previewGrid.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-img')) {
            const index = e.target.getAttribute('data-index');
            allFiles.splice(index, 1);
            renderPreviews();
        }
    });

    // 4. Manual Submit (The Magic Part)
    submitBtn.addEventListener('click', async () => {
        const formData = new FormData(form);
        
        // Remove any single file the input might have grabbed
        formData.delete('pledgecards[]'); 

        // Manually add all files from our array
        allFiles.forEach(file => {
            formData.append('pledgecards[]', file);
        });

        // Send to Adonis using fetch
        const response = await fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
            }
        });

        if (response.redirected) {
            window.location.href = response.url;
        } else {
            alert('Something went wrong during upload.');
        }
    });

});

window.markForDeletion = function(id) {
    const wrapper = document.getElementById(`card-${id}`);
    const checkbox = wrapper.querySelector('.delete-checkbox');
    
    // Check the hidden checkbox so the server knows to delete it
    checkbox.checked = true;
    
    // Hide the element from the UI
    wrapper.classList.add('hidden');
}