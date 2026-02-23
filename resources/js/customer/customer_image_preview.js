document.addEventListener('DOMContentLoaded', () => {
  let modal = document.getElementById('image-modal')

  if (!modal) {
    modal = document.createElement('div')
    modal.id = 'image-modal'

    modal.style.position = 'fixed'
    modal.style.top = '0'
    modal.style.left = '0'
    modal.style.width = '100vw'
    modal.style.height = '100vh'
    modal.style.background = 'rgba(75, 85, 99, 0.7)'
    modal.style.display = 'none'
    modal.style.alignItems = 'center'
    modal.style.justifyContent = 'center'
    modal.style.zIndex = '9999'

    modal.innerHTML = `
            <div id="modal-box"
                style="
                    background: white;
                    width: 75%;
                    height: 75%;
                    display:inline-flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 12px;
                    padding: 10px;
                ">
                
                <img id="modal-img"
                    style="
                        width: 85%;
                        height: 85%;
                        object-fit: contain;
                        border-radius: 8px;
                    " />    
            </div>
        `

    document.body.appendChild(modal)
  }

  const modalImg = modal.querySelector('#modal-img')
  const modalBox = modal.querySelector('#modal-box')

  document.addEventListener('click', (e) => {
    const img = e.target

    if (
      img.tagName === 'IMG' &&
      (img.closest('#preview-grid') || img.closest('#card-') || img.closest('.group'))
    ) {
      if (img.closest('button')) return

      modalImg.src = img.src
      modal.style.display = 'flex'
    }
  })

  // ✅ Close when clicking outside
  modal.addEventListener('click', (e) => {
    if (!modalBox.contains(e.target)) {
      modal.style.display = 'none'
      modalImg.src = ''
    }
  })
})
