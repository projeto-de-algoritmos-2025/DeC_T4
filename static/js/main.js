document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('start-btn');
    const visualizationsWrapper = document.getElementById('visualization-wrapper');
    const colorSelect = document.getElementById('num-colors-select');
    const imageChoices = document.querySelectorAll('.image-choice');

    let selectedImage = null;
    let selectedImageTitle = '';

    // Lógica para selecionar imagem
    imageChoices.forEach(choice => {
        choice.addEventListener('click', () => {
            imageChoices.forEach(c => c.classList.remove('selected'));
            choice.classList.add('selected');

            selectedImage = choice.dataset.image;
            selectedImageTitle = choice.querySelector('.card-body span').textContent.trim();

            startBtn.disabled = false;
        });
    });

    // Botão iniciar
    startBtn.addEventListener('click', async () => {
        if (!selectedImage) return;

        visualizationsWrapper.innerHTML = ''; // Limpa anterior
        startBtn.disabled = true;
        startBtn.innerHTML = `
            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            Processando...
        `; // Adiciona um spinner do Bootstrap

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

        try {
            // Chama a API no Flask
            const response = await fetch('/quantize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    image: selectedImage,
                    num_colors: numColors
                }),
            });
            const data = await response.json();

            // Esconde o "carregando"
            loadingIndicator.style.display = 'none';

            // Mostra a imagem original
            originalImgEl.src = document.querySelector(`.image-choice.selected img`).src;

            // Mostra a nova imagem quantizada
            quantizedImgEl.src = data.quantized_src;

            // Mostra a área de resultados
            imageResults.classList.remove('d-none');

            // Mostra a paleta de cores
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