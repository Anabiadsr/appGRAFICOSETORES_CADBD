import React, { useEffect, useState } from "react";
import {
  View,Text,TextInput,TouchableOpacity,StyleSheet,Alert,Modal,ScrollView, ActivityIndicator, Dimensions,Image,} from "react-native";
import { LineChart, PieChart } from "react-native-chart-kit";

const larguraTela = Dimensions.get("window").width;

export default function App() {
  const [modalCadastro, setModalCadastro] = useState(false);
  const [remedio, setRemedio] = useState("");
  const [quantidade, setQuantidade] = useState("");

  // Estados preparados para receber os dados dos gráficos
  const [nomes, setNomes] = useState([]);
  const [valores, setValores] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [loading, setLoading] = useState(true);

  const endereco = "http://10.67.57.170/AULAPAMII/grafico_farmacia";

  // Configuração visual padrão para os gráficos
  const chartConfig = {
    backgroundColor: "#ffffff",
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(15, 23, 42, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: "#2563eb",
    },
  };

  // Paleta de cores para o Gráfico de Pizza
  const cores = ["#f74780", "#fc6998", "#fa8fb1", "#ffc1d5", "ffe4ec"];

  async function carregarDados() {
    try {
      const resposta = await fetch(`${endereco}/geragraficos.php`);
      const dados = await resposta.json();

      if (Array.isArray(dados) && dados.length > 0) {
        // 1. Prepara dados para o Gráfico de Linhas
        const labels = dados.map((item) => item.marca || item.remedio);
        const values = dados.map((item) => Number(item.quantidade));
        setNomes(labels);
        setValores(values);

        // 2. Prepara dados para o Gráfico de Pizza
        const pizzaFormatada = dados.map((item, index) => ({
          name: item.marca || item.remedio,
          population: Number(item.quantidade),
          color: cores[index % cores.length],
          legendFontColor: "#334155",
          legendFontSize: 13,
        }));
        setPieData(pizzaFormatada);
      }
    } catch (erro) {
      console.log("Erro ao carregar gráfico:", erro);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  async function cadastrar() {
    if (remedio === "" || quantidade === "") {
      Alert.alert("Atenção", "Preencha todos os campos!");
      return;
    }

    try {
      const resposta = await fetch(`${endereco}/cadastrar.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          remedio: remedio,
          quantidade: quantidade,
        }),
      });

      const dados = await resposta.json();

      if (dados.sucesso) {
        Alert.alert("Sucesso", dados.mensagem);
        setRemedio("");
        setQuantidade("");
        setModalCadastro(false);
        carregarDados(); // Recarrega os gráficos após salvar
      } else {
        Alert.alert("Erro", dados.mensagem);
      }
    } catch (erro) {
      console.log("Erro:", erro);
      Alert.alert("Erro", "Não foi possível conectar ao servidor");
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.conteudo}>
      
      {/* IMAGEM LOCAL */}
      <Image 
        source={require('./assets/logo_sabrina.png')} 
        style={styles.logo} 
      />

      <Text style={styles.titulo}>Farmácia Sabrina</Text>
      <Text style={styles.descricao}>Visão Geral de Vendas</Text>

      <View style={styles.cardGrafico}>
        {loading ? (
          <ActivityIndicator size="large" color="#2563eb" />
        ) : nomes.length > 0 ? (
          <>


            <View style={styles.divisor} />

            {/* Gráfico de Pizza */}
            <Text style={styles.subtituloGrafico}>Gráfico de Pizza</Text>
            <PieChart
              data={pieData.map((item) => ({
                name: item.name,
                population: item.population,
                color: item.color,
                legendFontColor: item.legendFontColor,
                legendFontSize: item.legendFontSize,
              }))}
              width={larguraTela > 350 ? 320 : 280}
              height={220}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="#ffffff"
              paddingLeft="15"
              absolute
              style={{ marginVertical: 10, borderRadius: 16 }}
            />
          </>
        ) : (
          <Text style={styles.semDados}>Nenhum remédio encontrado.</Text>
        )}
      </View>

      <TouchableOpacity style={styles.botao} onPress={() => setModalCadastro(true)}>
        <Text style={styles.textoBotao}>Cadastrar Venda</Text>
      </TouchableOpacity>

      <Modal
        visible={modalCadastro}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalCadastro(false)}
      >
        <View style={styles.fundoModal}>
          <View style={styles.modal}>
            <Text style={styles.tituloModal}>Cadastrar Venda</Text>

            <Text style={styles.label}>Nome do Remédio</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Ibuprofeno"
              value={remedio}
              onChangeText={setRemedio}
            />

            <Text style={styles.label}>Quantidade vendida</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 15"
              keyboardType="numeric"
              value={quantidade}
              onChangeText={setQuantidade}
            />

            <TouchableOpacity style={styles.botaoCadastrar} onPress={cadastrar}>
              <Text style={styles.textoBotao}>Cadastrar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.botaoCancelar}
              onPress={() => setModalCadastro(false)}
            >
              <Text style={styles.textoCancelar}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#" },
  logo: {
    width: 200,      // Largura da imagem
    height: 200,     // Altura da imagem
    marginBottom: 2, // Espaço abaixo da imagem
    resizeMode: "contain" // Evita que a imagem fique esticada/deformada
  },
  conteudo: { 
    flexGrow: 1, 
    alignItems: "center", 
    paddingHorizontal: 16, 
    paddingTop: 30, 
    paddingBottom: 40 },
  titulo: { 
    fontSize: 28, 
    fontWeight: "bold", 
    color: "#0f172a", 
    marginBottom: 4 },
  descricao: { 
    fontSize: 15, 
    color: "#64748b", 
    marginBottom: 20 },
  cardGrafico: { 
    width: "100%", 
    maxWidth: 800, 
    backgroundColor: "##fff9f9", 
    borderRadius: 20, 
    paddingVertical: 20, 
    paddingHorizontal: 10, 
    marginBottom: 25, 
    alignItems: "center", 
    elevation: 5 },
  subtituloGrafico: { 
    fontSize: 16, 
    fontWeight: "bold", 
    color: "#334155", 
    alignSelf: "flex-start", 
    marginLeft: 15, 
    marginTop: 10, 
    marginBottom: 5 },
  grafico: { 
    marginVertical: 10, 
    borderRadius: 16 },
  divisor: { 
    height: 1, 
    backgroundColor: "#e2e8f0", 
    width: "90%", 
    marginVertical: 20 },
  semDados: { 
    color: "#64748b", 
    fontSize: 14, 
    marginVertical: 20 },
  botao: { 
    width: "100%", 
    maxWidth: 300, 
    backgroundColor: "#ff1d8d", 
    paddingVertical: 15, 
    borderRadius: 12, 
    alignItems: "center", 
    elevation: 4 },
  textoBotao: { 
    color: "#ffffff", 
    fontSize: 16, 
    fontWeight: "bold" },
  fundoModal: { 
    flex: 1, 
    backgroundColor: "rgba(15, 23, 42, 0.65)", 
    justifyContent: "center", 
    alignItems: "center", 
    padding: 20 },
  modal: { 
    width: "100%", 
    maxWidth: 430, 
    backgroundColor: "#ffffff", 
    padding: 25, 
    borderRadius: 20, 
    elevation: 8 },
  tituloModal: { 
    fontSize: 24, 
    fontWeight: "bold", 
    color: "#0f172a", 
    textAlign: "center", 
    marginBottom: 25 },
  label: { 
    fontSize: 14, 
    fontWeight: "bold", 
    color: "#334155", 
    marginBottom: 7 },
  input: { 
    width: "100%", 
    borderWidth: 1, 
    borderColor: "#cbd5e1", 
    backgroundColor: "#f8fafc", 
    borderRadius: 10, 
    paddingHorizontal: 14, 
    paddingVertical: 13, 
    fontSize: 15, 
    marginBottom: 18 },
  botaoCadastrar: { 
    backgroundColor: "#ff1d8d", 
    paddingVertical: 14, 
    borderRadius: 10, 
    alignItems: "center", 
    marginTop: 5 },
  botaoCancelar: { 
    marginTop: 10, 
    paddingVertical: 12, 
    borderRadius: 10, 
    alignItems: "center", 
    backgroundColor: "#a1bbff" },
  textoCancelar: { 
    color: "#ffff", 
    fontSize: 15, 
    fontWeight: "bold" },
});