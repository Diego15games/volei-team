// Módulo de Sincronização Bluetooth para o Vôlei Team
const SyncBT = {
    conectado: false,
    aoReceberDados: null, // Função que será chamada quando chegar ponto do outro celular

    // 1. Pede permissões de Bluetooth no Android moderno
    iniciar: function(callbackReceber) {
        this.aoReceberDados = callbackReceber;
        
        document.addEventListener('deviceready', () => {
            if (window.bluetoothSerial) {
                bluetoothSerial.enable(
                    () => console.log("Bluetooth ativado!"),
                    () => alert("Por favor, ative o Bluetooth do celular.")
                );
            }
        }, false);
    },

    // 2. Celular A (Anfitrião): Fica esperando o outro celular conectar
    criarSala: function(callbackStatus) {
        if (!window.bluetoothSerial) {
            alert("O Bluetooth só funciona depois que virar APK instalado!");
            return;
        }
        callbackStatus("Aguardando outro celular conectar... (Deixe o Bluetooth visível)");
        
        bluetoothSerial.listen(
            () => {
                this.conectado = true;
                callbackStatus("✅ Conectado ao outro celular!");
                this.escutarMensagens();
            },
            (erro) => {
                callbackStatus("❌ Erro ao criar sala: " + erro);
            }
        );
    },

    // 3. Celular B (Convidado): Lista aparelhos pareados para conectar
    listarAparelhos: function(callbackLista) {
        if (!window.bluetoothSerial) {
            alert("O Bluetooth só funciona depois que virar APK instalado!");
            return;
        }
        bluetoothSerial.list(
            (aparelhos) => callbackLista(aparelhos), // Retorna array com {name, address}
            (erro) => alert("Erro ao buscar aparelhos: " + erro)
        );
    },

    // 4. Conectar no aparelho escolhido da lista
    conectarNoAparelho: function(macAddress, callbackStatus) {
        callbackStatus("Conectando...");
        bluetoothSerial.connect(
            macAddress,
            () => {
                this.conectado = true;
                callbackStatus("✅ Conectado ao placar!");
                this.escutarMensagens();
            },
            (erro) => {
                this.conectado = false;
                callbackStatus("❌ Falha ao conectar: " + erro);
            }
        );
    },

    // 5. Fica ouvindo tudo o que o outro celular mandar
    escutarMensagens: function() {
        bluetoothSerial.subscribe('\n', (dadosRecebidos) => {
            try {
                const pacote = JSON.parse(dadosRecebidos.trim());
                if (this.aoReceberDados) {
                    this.aoReceberDados(pacote);
                }
            } catch (e) {
                console.log("Dado recebido inválido:", dadosRecebidos);
            }
        });
    },

    // 6. Envia o placar atualizado para o outro celular
    enviarPlacar: function(dadosObjeto) {
        if (this.conectado && window.bluetoothSerial) {
            const texto = JSON.stringify(dadosObjeto) + '\n';
            bluetoothSerial.write(texto);
        }
    }
};
