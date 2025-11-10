# Dividir e Conquistar - Gerador de Posters

## Alunos
| Matrícula | Nome |  
|:----------:|:---------------------------:|  
| 20/2046229 | Kallyne Macêdo Passos |  
| 20/0022199 | Leonardo Sobrinho de Aguiar | 

Dupla: 28 


## Descrição do projeto

Este projeto consiste em uma aplicação web interativa que demonstra o algoritmo de **Quantização de Cores** usando a técnica **Median Cut**. O foco da implementação é o uso do algoritmo **Mediana das Medianas**, que permite encontrar a mediana de um conjunto de pixels em tempo linear **$O(n)$**, otimizando o processo de divisão de cores.

A quantização de cores é um processo que reduz o número de cores distintas usadas em uma imagem, com o objetivo de que a nova imagem seja o mais similar possível à original, formando imagens similares a pôsters cinematográficos. 

A aplicação permite que o usuário escolha imagens pré-definidas (Mona Lisa, O Grito, Abaporu, etc.) ou envie sua própria imagem. O usuário pode então selecionar o número de cores desejado (K) para a paleta final (4, 8, 16, 32 ou 64). Assim, a imagem é processada e exibida na sua forma original e na forma quantizada (reconstruída), junto com a paleta de cores dominante extraída.


## Guia de instalação

Linguagem: Python, HTML, CSS e JavaScript
Framework: Flask
Pré-requisitos: Navegador instalado, Python, Flask e Pillow presentes no computador; clonar o repositório localmente.

### Passo a Passo

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/projeto-de-algoritmos-2025/DividireConquistar_Posters.git
    ```

2.  **Instale as Dependências:**
    ```bash
    pip install Flask Pillow
    ```

3.  **Inicie o Servidor:**
    Digite no mesmo terminal:
    ```bash
    python app.py
    ```

4.  **Acesse a Aplicação:**
    Abra seu navegador web e acesse o seguinte endereço: `http://127.0.0.1:5000`


## Uso

Após iniciar o servidor e acessar a aplicação no navegador:

1.  **Selecione a Imagem:** Clique em uma das quatro imagens pré-definidasou clique em "Enviar Imagem" para carregar um arquivo `.jpg` ou `.png` do seu computador.
2.  **Selecione o Nº de Cores:** Escolha quantas cores a paleta final deve ter (4, 8, 16, 32 ou 64). A opção padrão é 16.
3.  **Inicie:** Clique no botão "Iniciar Quantização".
4.  **Aguarde:** O backend processará a imagem.
5.  **Visualize:** A aplicação exibirá um novo card com a imagem original, a imagem quantizada com as cores reduzidas e a paleta de cores que foi gerada.


## Capturas de Tela

<div align="center">
Página Inicial
<img width="1912" height="930" alt="image" src="https://github.com/user-attachments/assets/f36f561e-d9bc-4bfc-ba5e-6eff3a418d0b" />
</div>
<br>

<div align="center">
Quantização - Mona Lisa 
<img width="1897" height="926" alt="image" src="https://github.com/user-attachments/assets/a4f4abd4-f255-4889-b554-74ea911df4e3" />
</div>
<br>

<div align="center">
Quantização - Moça com o Brinco de Pérola
<img width="1870" height="925" alt="image" src="https://github.com/user-attachments/assets/80ebd8eb-6c03-41e1-b1fd-689c1c896229" />
</div>
<br>

## Conclusões

O projeto é uma ferramenta eficaz para visualizar a aplicação de algoritmos de **Dividir e Conquistar** em um problema prático de processamento de imagem. A principal conclusão é a eficiência ganha ao utilizar a **Mediana das Medianas**, pois, em um algoritmo *Median Cut* padrão, seria necessário ordenar o balde de pixels a cada divisão para encontrar a mediana, uma operação de custo **$O(n \log n)$**. Com o MOM, encontramos a mediana em tempo linear **$O(n)$**.

Isso garante que o algoritmo de divisão seja o mais otimizado possível, tornando a quantização de cores significativamente mais rápida, especialmente para imagens com milhões de pixels.
