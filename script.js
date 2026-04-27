let selectedSizeId = null
let selectedFlavorsSet = new Set()

function cliente(){
    window.location.href = 'home.html'
}

function funcionario(){
    let senha = prompt('Insira a senha dos funcionários')

    if (senha === 'funcionario'){
        window.location.href = 'pedidos.html'
    }
    else {
        senha = prompt('Senha incorreta, tente novamente')
        if (senha === 'funcionario'){
            window.location.href = 'pedidos.html'
        }
    }
}

function size(tamanhoSelecionado){
    const buttons = document.querySelectorAll('.tamanho button')
    buttons.forEach(button => {
        if (button !== tamanhoSelecionado) {
            button.classList.remove('selected')
        }
    })

    if (tamanhoSelecionado.classList.contains('selected')) {
        tamanhoSelecionado.classList.remove('selected')
        selectedSizeId = null
    } else {
        tamanhoSelecionado.classList.add('selected')
        selectedSizeId = tamanhoSelecionado.id
    }
}

function flavor(saborSelecionado){
    const saborId = saborSelecionado.id
    
    if (selectedFlavorsSet.has(saborId)) {
        selectedFlavorsSet.delete(saborId)
        saborSelecionado.classList.remove('selected')
    } else {
        selectedFlavorsSet.add(saborId)
        saborSelecionado.classList.add('selected')
    }
}

function revisar(){
    const tamanho = selectedSizeId || ''
    const sabores = Array.from(selectedFlavorsSet).join(', ')
    const refrigerante = document.getElementById('refrigerante').value
    const molho = document.getElementById('molho').value
    const observacoes = document.getElementById('especificacoes').value
    
    if (!tamanho || selectedFlavorsSet.size === 0) {
        alert('Por favor, selecione pelo menos o tamanho e um sabor para a pizza.')
        return
    }

    localStorage.setItem('tamanhoSelecionado', tamanho)
    localStorage.setItem('saboresSelecionados', sabores)
    localStorage.setItem('refrigeranteSelecionado', refrigerante)
    localStorage.setItem('molhoSelecionado', molho)
    localStorage.setItem('observacoes', observacoes)

    window.location.href = 'revisão.html'
}

function carregarResumo(){
    if (document.getElementById('resumo-tamanho')) {
        const tamanho = localStorage.getItem('tamanhoSelecionado') || 'Não Selecionado'
        const sabores = localStorage.getItem('saboresSelecionados') || 'Não Selecionado'
        const refrigerante = localStorage.getItem('refrigeranteSelecionado') || 'Nenhum'
        const molho = localStorage.getItem('molhoSelecionado') || 'Nenhum'
        const observacoes = localStorage.getItem('observacoes') || 'Nenhuma'

        document.getElementById('resumo-tamanho').textContent = `Tamanho da pizza: ${tamanho}`
        document.getElementById('resumo-sabor').textContent = `Sabor da pizza: ${sabores}`
        document.getElementById('resumo-refrigerante').textContent = `Refrigerante: ${refrigerante}`
        document.getElementById('resumo-molho').textContent = `Molho extra: ${molho}`
        document.getElementById('resumo-especificacoes').textContent = `Especificações adicionais: ${observacoes}`

        const form = document.getElementById('form-pedido')
        if (form) {
            document.getElementById('input-tamanho').value = tamanho
            document.getElementById('input-sabores').value = sabores
            document.getElementById('input-refrigerante').value = refrigerante
            document.getElementById('input-molho').value = molho
            document.getElementById('input-observacoes').value = observacoes
            
            const inputHora = document.createElement('input')
            inputHora.type = 'hidden'
            inputHora.name = 'hora'
            inputHora.value = new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})
            form.appendChild(inputHora)
            
            form.addEventListener('submit', () => {
                localStorage.removeItem('tamanhoSelecionado')
                localStorage.removeItem('saboresSelecionados')
                localStorage.removeItem('refrigeranteSelecionado')
                localStorage.removeItem('molhoSelecionado')
                localStorage.removeItem('observacoes')
            })
        }
    }
}

async function carregarPedidos(){
    const listaContainer = document.getElementById('pedidos-lista')
    
    if (!listaContainer) return

    try {
        const response = await fetch('http://127.0.0.1:5000/api/pedidos')
        
        if (!response.ok) {
            throw new Error('Erro ao buscar pedidos do servidor.')
        }

        const listaPedidos = await response.json()
        listaContainer.innerHTML = ''

        if (listaPedidos.length === 0) {
            listaContainer.innerHTML = '<p class="sem-pedidos">Nenhum pedido pendente no momento.</p>'
            return
        }

        listaPedidos.forEach(pedido => {
            const pedidoDiv = document.createElement('div')
            pedidoDiv.className = `pedido-card status-${pedido.status.replace(/\s/g, '-').toLowerCase()}`
            pedidoDiv.dataset.id = pedido.id
            
            pedidoDiv.innerHTML = `
                <div class="header-pedido">
                    <h4>Pedido #${pedido.id} - ${pedido.hora}</h4>
                    <span class="status-badge">${pedido.status}</span>
                </div>
                <p><strong>Tamanho:</strong> ${pedido.tamanho}</p>
                <p><strong>Sabores:</strong> ${pedido.sabores}</p>
                <p><strong>Acompanhamentos:</strong> ${pedido.refrigerante} | ${pedido.molho}</p>
                ${pedido.observacoes ? `<p class="observacoes"><strong>Obs:</strong> ${pedido.observacoes}</p>` : ''}
                <button onclick="marcarComoPronto(${pedido.id})" class="btn-pronto">Marcar como Pronto</button>
            `
            listaContainer.appendChild(pedidoDiv)
        })

    } catch (error) {
        console.error('Falha ao carregar pedidos:', error)
        listaContainer.innerHTML = '<p class="sem-pedidos">Erro ao conectar com o servidor de pedidos.</p>'
    }
}

async function marcarComoPronto(idPedido){
    try {
        const response = await fetch(`http://127.0.0.1:5000/api/pedidos/${idPedido}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: 'Pronto para Entrega' })
        })

        if (!response.ok) {
            throw new Error(`Erro HTTP ao atualizar status! Status: ${response.status}`)
        }

        carregarPedidos() 

    } catch (error) {
        console.error('Falha ao marcar como pronto:', error)
        alert('Erro ao atualizar o status do pedido.')
    }
}

document.addEventListener('DOMContentLoaded', () => {
    carregarResumo()
    carregarPedidos()
})