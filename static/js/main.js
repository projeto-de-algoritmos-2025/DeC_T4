document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('start-btn');
    const visualizationsWrapper = document.getElementById('visualization-wrapper');
    const colorSelect = document.getElementById('num-colors-select');
    const imageChoices = document.querySelectorAll('.image-choice');
    const imageUploadInput = document.getElementById('image-upload-input');
    const uploadCardLabel = document.getElementById('upload-card-label');
    const uploadCardText = document.getElementById('upload-card-text');

    let selectedImageKey = null;
    let uploadedFile = null;
    let selectedImageTitle = '';
    let originalImageSrc = '';

    // Lógica para selecionar imagem
    imageChoices.forEach(choice => {
        choice.addEventListener('click', () => {
            // Limpa a seleção
            imageChoices.forEach(c => c.classList.remove('selected'));
            uploadCardLabel.classList.remove('selected');
            uploadCardText.textContent = 'Enviar Imagem'; // Card de upload volta ao texto original

            // Adiciona seleção ao clicado
            choice.classList.add('selected');

            // Define a imagem pré-definida
            selectedImageKey = choice.dataset.image;
            selectedImageTitle = choice.querySelector('.card-body span').textContent.trim();
            originalImageSrc = choice.querySelector('img').src;

            // Limpa o input de arquivo
            uploadedFile = null;
            imageUploadInput.value = '';

            startBtn.disabled = false;
        });
    });

    // Lógica para o upload de arquivo
    imageUploadInput.addEventListener('change', (event) => {
        if (event.target.files && event.target.files[0]) {
            uploadedFile = event.target.files[0];

            // Deseleciona as imagens 
            imageChoices.forEach(c => c.classList.remove('selected'));
            selectedImageKey = null;

            uploadCardLabel.classList.add('selected');
            uploadCardText.textContent = uploadedFile.name.substring(0, 15) + '...'; // Mostra o nome do arquivo

            // Define os títulos e a URL da imagem original
            selectedImageTitle = uploadedFile.name;
            originalImageSrc = URL.createObjectURL(uploadedFile);

            startBtn.disabled = false;
        }
    });

    // Botão iniciar
    startBtn.addEventListener('click', async () => {
        if (!selectedImageKey && !uploadedFile) return;

        visualizationsWrapper.innerHTML = ''; // Limpa anterior
        startBtn.disabled = true;

        startBtn.innerHTML = `
            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            Processando...
        `;

        const numColors = colorSelect.value;

        // Vis do resultado
        const vizContainer = document.createElement('div');
        vizContainer.className = 'row justify-content-center';
        const cardHTML = `
            <div class="col-lg-10">
                <div class="card shadow-sm mb-4">
                    <div class="card-header text-center">
                        <h3 class="h5 mb-0">${selectedImageTitle} (${numColors} Cores)</h3>
                    </div>
                    <div class="card-body">
                        <div id="loading-indicator" class="text-center p-4">
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                            <p class="mt-2">Processando imagem... Isso pode levar alguns segundos.</p>
                            <p class->(O algoritmo Mediana das Medianas está trabalhando!)</p>
                        </div>
                        
                        <div id="image-results" class="row g-3 d-none"> 
                            <div class="col-md-6 text-center">
                                <h5>Original</h5>
                                <img id="original-img" class="img-fluid rounded border">
                            </div>
                            <div class="col-md-6 text-center">
                                <h5>Quantizada (${numColors} cores)</h5>
                                <img id="quantized-img" class="img-fluid rounded border">
                            </div>
                        </div>

                        <div id="palette-container-wrapper" class="mt-4 d-none">
                            <h5 class="text-center">Paleta Gerada</h5>
                            <div id="palette-container" class="d-flex flex-wrap justify-content-center gap-2 p-3 bg-light rounded border">
                                </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        vizContainer.innerHTML = cardHTML;
        visualizationsWrapper.appendChild(vizContainer);

        // Seleciona elementos dentro do vizContainer
        const loadingIndicator = vizContainer.querySelector('#loading-indicator');
        const imageResults = vizContainer.querySelector('#image-results');
        const paletteWrapper = vizContainer.querySelector('#palette-container-wrapper');
        const paletteContainer = vizContainer.querySelector('#palette-container');
        const originalImgEl = vizContainer.querySelector('#original-img');
        const quantizedImgEl = vizContainer.querySelector('#quantized-img');

        // Envia com FormData
        const formData = new FormData();
        formData.append('num_colors', numColors);

        if (uploadedFile) {
            formData.append('image_file', uploadedFile);
        } else if (selectedImageKey) {
            formData.append('image_key', selectedImageKey);
        }

        try {
            // Chama a API no Flask
            const response = await fetch('/quantize', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();

            // Esconde o "carregando"
            loadingIndicator.style.display = 'none';

            // Mostra a imagem original
            originalImgEl.src = originalImageSrc;
            originalImgEl.onload = () => {
                // Libera memória
                if (uploadedFile) {
                    URL.revokeObjectURL(originalImageSrc);
                }
            }

            // Mostra a nova imagem quantizada
            quantizedImgEl.src = data.quantized_src;

            // Area de resultados
            imageResults.classList.remove('d-none');

            // Paleta de cores
            data.palette.forEach(color => {
                const colorSwatch = document.createElement('div');
                colorSwatch.className = 'color-swatch';
                colorSwatch.style.backgroundColor = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
                colorSwatch.title = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
                paletteContainer.appendChild(colorSwatch);
            });
            paletteWrapper.classList.remove('d-none');

        } catch (error) {
            console.error('Erro ao quantizar:', error);
            loadingIndicator.innerHTML = '<p class="text-danger">Erro ao processar a imagem.</p>';
        }

        // Restaura o botão
        startBtn.disabled = false;
        startBtn.innerHTML = 'Iniciar Quantização';
    });
});
