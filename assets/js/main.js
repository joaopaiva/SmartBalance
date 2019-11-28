 // Create a client instance
 client = new Paho.MQTT.Client("farmer.cloudmqtt.com", 34757, "ProjetoAC");

 // set callback handlers
 client.onConnectionLost = onConnectionLost;
 client.onMessageArrived = onMessageArrived;
 var options = {
     useSSL: true,
     userName: "intobmhj",
     password: "6kTSPy8I_1Pk",
     onSuccess: onConnect,
     onFailure: doFail
 }

 // connect the client
 client.connect(options);
 var aux;
 var aux1;


function onConnect() {
     // Once a connection has been made, make a subscription and send a message.


     //client.subscribe("/btnPorta");
     //client.subscribe("/btnAlarme");
     //client.subscribe("alarmStatus");
     client.subscribe("icc/truck_report");

     aux = 0;
     aux1 = 0;
     document.getElementById('btnAbrirPorta').style.background = '#FF0000';
     document.getElementById('btnAbrirPorta').style.color = '#000000';
 }

 function doFail(e) {
     console.log(e);
 }

 // called when the client loses its connection
 function onConnectionLost(responseObject) {
     if (responseObject.errorCode !== 0) {
         console.log("onConnectionLost:" + responseObject.errorMessage);
     }

 }
//setTimeout(onConnect, 2500);

 // called when a message arrives



 // Your web app's Firebase configuration
 var firebaseConfig = {
    apiKey: "AIzaSyBdXxopsLSxE5R7xKsvPtiLzFtJthzrjkc",
    authDomain: "smartbalance-adc93.firebaseapp.com",
    databaseURL: "https://smartbalance-adc93.firebaseio.com",
    projectId: "smartbalance-adc93",
    storageBucket: "smartbalance-adc93.appspot.com",
    messagingSenderId: "913614222495",
    appId: "1:913614222495:web:b151fbe660b8de96b01eaa"
  };
 // Initialize Firebase
firebase.initializeApp(firebaseConfig);

const rootReft = firebase.database().ref().child('Transporte/Cadastro');
const rootRefc = firebase.database().ref().child('Transporte/Carga');
const rootRefp = firebase.database().ref().child('Transporte/Porta');

var alarmeLigado = 0;

function resetPeso(){
    const ref = rootRefc.child('1');
    ref.once('value', function(snapshot) {
        const updates = {};
        snapshot.forEach(function(childSnapshot){
            updates[childSnapshot.key] = null
            ref.update(updates);
        });
    });
}

function Apagar() {

    swal({
        title: "Deseja excluir esses dados?\n\n",
        icon: "success",
        buttons: true,
      })
      .then((willDelete) => {
        if (willDelete) {
            rootReft.set(null);
    $("#varNome").val("");
    $("#varEmpresa").val("");
    $("#varPlaca").val("");
    $("#varCNH").val("");
    $("#varIdCarga").val("");
    $("#varPeso").val("");
        }
      });
}

function cadastrar(){

    swal({
        title: "Deseja alterar esses dados?\n\n",
        icon: "warning",
        buttons: true,
      })
      .then((willDelete) => {

        if(!$('#peso').val()){
            swal({
                title: "Peso Inicial Obrigatório",
                text: "Digite o peso inicial e tente novamente!\n\n",
                icon: "error",
            });
            return;
        }
        if (willDelete) {
            rootReft.set({
                nome:$('#nome').val(),
                empresa: $('#empresa').val(),
                placa: $('#placa').val(),
                CNH: $('#cnh').val(),
                idCarga:$('#idCarga').val(),
                peso:$('#peso').val()
            });
            swal({
                title: "Sucesso!!!:",
                text: "Cadastro alterado com sucesso!!!\n\n",
                icon: "success",
            });
        }
      });
}

function email(){
    firebase.auth().createUserWithEmailAndPassword($('#userEmailCa').val(), $('#userPasswordCA').val())
    .catch(error => {
        const errorCode = error.code;
        const errorMessage = error.message;
    });
    swal({
        title: "Sucesso!!!:",
        text: "Cadastro realizado com sucesso!!!\n\n",
        icon: "success",
    });
}

function ligarAlarme(){
    message = new Paho.MQTT.Message('{"alarmCtrl": "2"}');
    message.destinationName = "icc/truck_command";
    client.send(message);

    alarmeLigado = 1;
    rootRefc.update({ statusAlarme: true });

    swal({
        title: "Atenção!",
        text: "O alarme foi acionado!\n\n",
        icon: "warning",
        dangerMode: true,
        buttons: ['Cancelar', 'Desligar Alarme']
        //timer: 2500
    })
    .then((willDelete) => {
      if (willDelete) {
          desligaAlarme();
      }
    });

}

function enviaMsg(string = '{"truckWeight": "4","alarmStatus": "1"}', destination = 'icc/truck_report'){
    message = new Paho.MQTT.Message(string);
    message.destinationName = destination;
    client.send(message);

    swal({
        title: "Mensagem Enviada",
        text: "Mensagem enviada com sucesso!!!\n\n",
        icon: "success",
        buttons: false,
        timer: 2500
    });
}


function desligaAlarme(){
    message = new Paho.MQTT.Message('{"alarmCtrl": "1"}');
    message.destinationName = "icc/truck_command";
    client.send(message);

    rootRefc.update({ statusAlarme: false });

    swal({
        title: "Sucesso!!!:",
        text: "Alarme Desligado com sucesso!!!\n\n",
        icon: "success",
        buttons: false,
        timer: 2500
    });

}

function btnPorta(){
    if ($('#varStatusPorta').val() == 'Fechada') {
        message = new Paho.MQTT.Message('{"doorCommand": "1"}');
        document.getElementById('btnAbrirPorta').style.background = '#00FF00';
        document.getElementById('btnAbrirPorta').style.color = '#000000';
        $("#btnAbrirPorta").html("Abrir Porta");
        aux1 = 1;
        $('#varStatusPorta').val('Aberta');
        swal({
            title: "Atenção!",
            text: "A porta foi aberta!\n\n",
            icon: "warning",
            buttons: false,
            timer: 2500
        });
    } else if($('#varStatusPorta').val() == 'Aberta') {
        message = new Paho.MQTT.Message('{"doorCommand": "0"}');
        document.getElementById('btnAbrirPorta').style.background = '#FF0000';
        $("#btnAbrirPorta").html("Fechar Porta");
        document.getElementById('btnAbrirPorta').style.color = '#000000';
        aux1 = 0;
        $('#varStatusPorta').val('Fechada');
        swal({
            title: "Atenção!",
            text: "A porta foi fechada!\n\n",
            icon: "warning",
            buttons: false,
            timer: 2500
        });
    }

    message.destinationName = "icc/truck_command";
    client.send(message);
}



function salvar(estado) {

   if (estado == 1) {
       rootRefc.push($('#varPesoAtual').val());
       rootRefc.update({Peso_Atual: $('#varPesoAtual').val()});
   } else if (estado == 2) {
       rootRefp.push($('#varStatusPorta').val());
       rootRefp.update({Status_Porta: $('#varStatusPorta').val()});
   }
 }


function salvarPeso(peso, timestamp, id) {

    if(peso && timestamp && id)
    {
        rootRefc.child(id + '/' + timestamp).push(peso);
        //rootRefc.update({Peso_Atual: $('#varPesoAtual').val()});
    }else {
        console.log("Erro ao salvar peso.")
    }

 }

 /*function onMessageArrived(message) {
     client.subscribe("truckWeight");
     var topic = message.destinationName;
     var payload = message.payloadString;
     var estado
     if (topic == "truckWeight") {
         var peso = payload;
         $("#varPesoAtual").val(peso);
         estado=1;
         salvar(estado);
     }
     if (topic == "alarmStatus") {
         var porta = payload;
         if(porta=='1'){
            $("#varStatusPorta").val("Fechada");
         }else{
            $("#varStatusPorta").val("Aberta");
         }
         estado=2;
         salvar(estado);
     }
 }*/

 var i = 0;

 function onMessageArrived(message) {
     client.subscribe("icc/truck_report");
     var topic = message.destinationName;
     var payload = message.payloadString;
     //var peso = payload[0];
     //console.log(payload);
    // console.log(peso['truckWeight']);
     //console.log(peso[0]);

     var msgCount = 1; //Intervalo de mensagens para se salvar o peso

     message = new Paho.MQTT.Message('{"alarmCtrl": "1"}');

     if (topic == "icc/truck_report") {
         i++;

         var payload = JSON.parse(payload) ;
         var peso = payload['truckWeight'];
         var alarmeStatus = payload['alarmStatus'];

         console.log(i, msgCount);
        if(i==msgCount){
            salvarPeso(peso, Date.now()/1000 | 0, 1);
            i=0;
        }

         var pesoInicial = $("#varPeso").val();

         $("#varPesoAtual").val(peso);

         //ligarAlarme();
         if( (pesoInicial < 0.8*peso || pesoInicial > 1.2*peso))
            ligarAlarme();

         if(alarmeStatus=='1'){
            //ligarAlarme();
            rootRefp.update({ Status_Porta: 'Aberta' });
            $("#varStatusPorta").val("Aberta");
            $("#btnDesligaAlarme").attr("disabled", false);
            document.getElementById('btnAbrirPorta').style.background = '#FF0000';
            $("#btnAbrirPorta").html("Fechar Porta");
            document.getElementById('btnAbrirPorta').style.color = '#000000';

        }else if(alarmeStatus=='2'){
            ligarAlarme();
            /* APENAS ACIONA O ALARME NO DISPOSITIVO DE HARDWARE*/
            // $("#varStatusPorta").val("Aberta");
            // $("#btnDesligaAlarme").attr("disabled", false);
            // document.getElementById('btnAbrirPorta').style.background = '#FF0000';
            // $("#btnAbrirPorta").html("Fechar Porta");
            // document.getElementById('btnAbrirPorta').style.color = '#000000';
         }
         else{
            rootRefp.update({ Status_Porta: 'Fechada' });
            $("#varStatusPorta").val("Fechada");
            $("#btnDesligaAlarme").attr("disabled", true);
            document.getElementById('btnAbrirPorta').style.background = '#00FF00';
            document.getElementById('btnAbrirPorta').style.color = '#000000';
            $("#btnAbrirPorta").html("Abrir Porta");
         }
     }

     if (topic == "icc/truck_command") {
         i++;

         var payload = JSON.parse(payload) ;
         var alarmCtrl = payload['alarmCtrl'];

         if(alarmCtrl=='1'){
            desligaAlarme();
        }else if(alarmCtrl=='2'){
            ligarAlarme();
            /* APENAS ACIONA O ALARME NO DISPOSITIVO DE HARDWARE*/
            // $("#varStatusPorta").val("Aberta");
            // $("#btnDesligaAlarme").attr("disabled", false);
            // document.getElementById('btnAbrirPorta').style.background = '#FF0000';
            // $("#btnAbrirPorta").html("Fechar Porta");
            // document.getElementById('btnAbrirPorta').style.color = '#000000';
         }
     }

 }

load();
function load() {
   rootReft.on('value', function(snapshot){$('#varNome').val(snapshot.child('nome').val());});
   rootReft.on('value', function(snapshot){$('#varPlaca').val(snapshot.child('placa').val());});
   rootReft.on('value', function(snapshot){$('#varEmpresa').val(snapshot.child('empresa').val());	});
   rootReft.on('value', function(snapshot){$('#varCNH').val(snapshot.child('CNH').val());});
   rootReft.on('value', function(snapshot){$('#varIdCarga').val(snapshot.child('idCarga').val());	});
   rootReft.on('value', function(snapshot){$('#varPeso').val(snapshot.child('peso').val());});

   rootReft.on('value', function(snapshot){$('#nome').val(snapshot.child('nome').val());});
   rootReft.on('value', function(snapshot){$('#placa').val(snapshot.child('placa').val());});
   rootReft.on('value', function(snapshot){$('#empresa').val(snapshot.child('empresa').val());	});
   rootReft.on('value', function(snapshot){$('#cnh').val(snapshot.child('CNH').val());});
   rootReft.on('value', function(snapshot){$('#idCarga').val(snapshot.child('idCarga').val());	});
   rootReft.on('value', function(snapshot){$('#peso').val(snapshot.child('peso').val());});


   rootRefc.once('value', function(snapshot){
       var statusA = snapshot.child('statusAlarme').val();

       if(statusA == true){
           ligarAlarme();
           $("#btnDesligaAlarme").attr("disabled", true);
       }else if(statusA == false){
           $("#btnDesligaAlarme").attr("disabled", false);
       }
   });

   rootRefp.once('value', function(snapshot){
       var statusP = snapshot.child('Status_Porta').val();
       $('#varStatusPorta').val(statusP);
       var btnAbrirPorta = document.getElementById('btnAbrirPorta');

       console.log(btnAbrirPorta, typeof btnAbrirPorta);


       if(statusP == 'Aberta' && btnAbrirPorta){
           btnAbrirPorta.style.background = '#FF0000';
           btnAbrirPorta.style.color = '#000000';
           $("#btnAbrirPorta").html("Fechar Porta");
       }else if( statusP == 'Fechada' && btnAbrirPorta){
           btnAbrirPorta.style.background = '#00FF00';
           btnAbrirPorta.style.color = '#000000';
           $("#btnAbrirPorta").html("Abrir Porta");
       }

   });
   return;
}

/*setTimeout(verifica, 4000);
function verifica() {
    swal({
        title: "Alerta!!!:",
        text: "Dados de peso incompativeis!!!\n\n",
        icon: "warning",
    });
    if($('#peso').val()*1.2 < $('#varPesoAtual').val() || $('#peso').val()*0.8 < $('#varPesoAtual').val()){
        swal({
            title: "Alerta!!!:",
            text: "Dados de peso incompativeis!!!\n\n",
            icon: "warning",
        });
    }
}*/
