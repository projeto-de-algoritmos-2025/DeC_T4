import os
import io
import base64
from flask import Flask, render_template, jsonify, request
from PIL import Image
import math

app = Flask(__name__)

# Estrutura de imagens
IMAGE_FOLDER = os.path.join('static', 'images')
IMAGE_FILES = {
    'monalisa': os.path.join(IMAGE_FOLDER, 'mona.jpg'),
    'pearl': os.path.join(IMAGE_FOLDER, 'pearl.jpg'),
    'the_scream': os.path.join(IMAGE_FOLDER, 'scream.jpg'),
    'abaporu': os.path.join(IMAGE_FOLDER, 'abaporu.jpg')
}

# Rota Principal
@app.route('/')
def index():
    """Serve a página principal."""
    return render_template('index.html')

# Rota da API 
@app.route('/quantize', methods=['POST'])
def quantize_image_route():
    """Recebe um pedido para quantizar uma imagem e retorna a imagem e a paleta."""
        
    # Pega o número de cores do formulário (FormData)
    num_colors = int(request.form.get('num_colors', 8))
    
    image = None
    
    # Verifica envio de arquivo
    if 'image_file' in request.files and request.files['image_file'].filename != '':
        file = request.files['image_file']
        image = Image.open(file.stream).convert('RGB') 
    
    # Verifica chave de imagem pré-carregada
    elif 'image_key' in request.form:
        image_key = request.form.get('image_key')
        if image_key in IMAGE_FILES:
            image_path = IMAGE_FILES[image_key]
            image = Image.open(image_path).convert('RGB')
    
    if image is None:
        return jsonify({'error': 'Nenhuma imagem válida foi fornecida'}), 400
    
    # Pega todos os pixels da imagem
    pixels = list(image.getdata())
    
    # Gera a paleta de cores usando Median Cut c/ MOM
    palette = median_cut(pixels, num_colors)
    
    # Aplica a paleta de volta à imagem - algoritmo de "vizinho mais próximo"
    quantized_image = apply_palette(image, palette)
    
    # Converte a nova imagem para base64
    buffered = io.BytesIO()
    quantized_image.save(buffered, format="JPEG")
    img_str = base64.b64encode(buffered.getvalue()).decode('utf-8')

    # Formata a paleta para o frontend
    palette_rgb = [list(map(int, color)) for color in palette]
    
    return jsonify({
        'quantized_src': f'data:image/jpeg;base64,{img_str}',
        'palette': palette_rgb
    })

# Mediana das Medianas - encontra o k-ésimo menor elemento em tempo linear O(n).

def kth_smallest_element(pixel_list, k, channel):
    """
    Encontra o k-ésimo menor pixel com base em um 'channel' (0=R, 1=G, 2=B)
    """
    
    # Caso base: para listas pequenas, apenas ordene e retorne.
    if len(pixel_list) <= 10:
        sorted_list = sorted(pixel_list, key=lambda p: p[channel])
        return sorted_list[k]

    # Agrupar os números em conjuntos de 5 
    chunks = [pixel_list[i:i + 5] for i in range(0, len(pixel_list), 5)]

    # Encontrar a mediana de cada grupo
    medians = []
    for chunk in chunks:
        sorted_chunk = sorted(chunk, key=lambda p: p[channel])
        median = sorted_chunk[len(sorted_chunk) // 2]
        medians.append(median)

    # Encontrar a mediana das medianas (MOM) recursivamente
    mom = kth_smallest_element(medians, len(medians) // 2, channel)
    mom_value = mom[channel]

    # Particionar os dados originais em torno do MOM
    L = [p for p in pixel_list if p[channel] < mom_value]
    R = [p for p in pixel_list if p[channel] > mom_value]
    M = [p for p in pixel_list if p[channel] == mom_value]

    # Retornar ou recorrer
    if k < len(L):
        # O k-ésimo está no conjunto L
        return kth_smallest_element(L, k, channel)
    elif k < len(L) + len(M):
        # O k-ésimo é o próprio MOM
        return mom
    else:
        # O k-ésimo está no conjunto R
        return kth_smallest_element(R, k - len(L) - len(M), channel)

# Median Cut - constrói a paleta de cores 

def median_cut(pixels, num_colors):
    """
    Constrói uma paleta de 'num_colors' a partir da lista de pixels.
    """
    # Balde de pixels
    buckets = [pixels]

    num_splits = int(math.log2(num_colors))
    
    for _ in range(num_splits):
        new_buckets = []
        for bucket in buckets:
            if not bucket:
                continue
            
            # Encontrar o canal (R, G ou B) com a maior variação
            min_r = min(p[0] for p in bucket)
            max_r = max(p[0] for p in bucket)
            min_g = min(p[1] for p in bucket)
            max_g = max(p[1] for p in bucket)
            min_b = min(p[2] for p in bucket)
            max_b = max(p[2] for p in bucket)
            
            range_r = max_r - min_r
            range_g = max_g - min_g
            range_b = max_b - min_b
            
            # Escolhe o canal com maior variação
            channel = 0 # Red
            if range_g > range_r and range_g > range_b:
                channel = 1 # Green
            elif range_b > range_r and range_b > range_g:
                channel = 2 # Blue
            
            # Encontrar a mediana do canal escolhido usando MOM
            k = len(bucket) // 2
            median_pixel = kth_smallest_element(bucket, k, channel)
            median_value = median_pixel[channel]
            
            # Dividir o balde em dois com base na mediana
            b1 = [p for p in bucket if p[channel] <= median_value]
            b2 = [p for p in bucket if p[channel] > median_value]
            
            new_buckets.extend([b1, b2])
        buckets = new_buckets

    # Criar a paleta final calculando a média de cada balde
    palette = []
    for bucket in buckets:
        if not bucket:
            continue
        avg_r = sum(p[0] for p in bucket) // len(bucket)
        avg_g = sum(p[1] for p in bucket) // len(bucket)
        avg_b = sum(p[2] for p in bucket) // len(bucket)
        palette.append((avg_r, avg_g, avg_b))
        
    return palette

# Encontra paleta de cores - Nearest Neighbor.

def apply_palette(image, palette):
    """Cria uma nova imagem mapeando cada pixel para a cor mais próxima na paleta."""
    new_image = Image.new('RGB', image.size)
    
    # cache de cores já calculadas
    memo = {}

    for y in range(image.height):
        for x in range(image.width):
            original_color = image.getpixel((x, y))
            
            if original_color not in memo:
                # Encontra a cor mais próxima na paleta 
                min_dist = float('inf')
                best_color = palette[0]
                for color in palette:
                    dist = (original_color[0] - color[0])**2 + \
                           (original_color[1] - color[1])**2 + \
                           (original_color[2] - color[2])**2
                    if dist < min_dist:
                        min_dist = dist
                        best_color = color
                memo[original_color] = best_color
            
            new_image.putpixel((x, y), memo[original_color])
            
    return new_image

if __name__ == '__main__':
    app.run(debug=True)
