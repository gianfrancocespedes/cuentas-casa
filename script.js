/**
 * Variable globales
 */
let visible = false;
let datos;
let totalesLuz = {
    departamento2A : 0,
    departamento2B : 0,
    departamento3A : 0,
    departamento3B : 0,
};

/**
 * Dark Mode
 */
//Función para alternar el tema entre Light y Dark
function cambiarTema(){
    let pagina = document.getElementById('webPage');
    //console.log("Antes: "+ pagina.getAttribute('data-theme'));
    var targetTheme = pagina.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    if(targetTheme == 'light'){
        document.getElementById("boton_tema").innerHTML="<i class='fa-solid fa-moon'></i>&nbsp&nbspCambiar Tema";
    }else{
        document.getElementById("boton_tema").innerHTML="<i class='fa-solid fa-brightness'></i>&nbsp&nbspCambiar Tema";
    }
    pagina.setAttribute('data-theme', targetTheme);
    //console.log("Después: "+ pagina.getAttribute('data-theme'));
}


/**
 * Eventos
 */
//Captura los datos del formulario (Truco). El nombre de cada campo es el declarado en el campo name.
document.getElementById("form_principal").addEventListener('submit', e => {
    e.preventDefault();
    const data = Object.fromEntries(
        new FormData(e.target)
    );
    datos = data;
    //console.log(datos);
    calcularCuentas();
    //console.log(JSON.stringify(data));
    
});

/**
 * Funciones para hacer los cálculos y gestionar la generación de PDF's
 */
//Función que realiza el proceso de calcular las cuentas.
function calcularCuentas() {
    /**
     * Se valida que todos los campos esten llenos
     */
    let faltanDatos = false;
    //console.log(Object.values(datos));
    Object.values(datos).filter(e => {
        if(e == ""){
            alert("COMPLETE TODOS LOS CAMPOS");
            faltanDatos = true;
        }
    })
    if(faltanDatos)return;

    var fecha_hora_calculo = new Date();
    if(!visible){
        //CAMBIARLO POR DISPLAY: NONE YA QUE AL SOLO SER INVISIBLE HAY UN ESPACIO GRANDE AL FINAL DE LA PÁGINA
        document.getElementById("descargas").style.visibility = "visible";  
        document.getElementById("linea").style.visibility = "visible";
        visible = !visible;
    }
    document.getElementById("fecha_hora_calculo").innerHTML = "Resultado calculado el: "+fecha_hora_calculo.toLocaleString();
    gestionarPDFs();
    //console.log(datos);
}



function generarPDF(piso){
    // Parámetros para la libería JsPDF
    let tamañoLetra = 15;
    let doc = new jsPDF({
        format: [350, 400]
    });
    doc.setFontSize(tamañoLetra);
    doc.setFont("courier", "normal");
    
    if(piso == '1'){
        let num;
        /**
         * Título
         */
        doc.text("Piso 1", 63, 10,'center');
        doc.text(`${getNombreMes(datos.calculo_mes)}/${datos.calculo_anio}`, 63, 15,'center');
        /**
         * Luz
         */
        num = (parseFloat(datos.total_luz) - getTotalLuzDep()).toFixed(2);
        doc.text(`Luz: ${datos.total_luz} - ${getTotalLuzDep()} = S/${num}`, 20, 25);
        /**
         * Agua
         */
        doc.text(`Agua:`, 20, 35);
        num = (parseFloat(datos.total_agua)/getTotalPersonas()).toFixed(2);
        doc.text(`${datos.total_agua} ${String.fromCharCode(247)} ${getTotalPersonas()} = S/${num}`, 30, 40);
        doc.text(`${num} x ${datos.personas_piso1} = S/${(num * datos.personas_piso1).toFixed(2)}`, 30, 45);
        /**
         * Gas
         */
        doc.text(`Gas:`, 20, 55);
        doc.text(`S/${datos.gas_piso1}`, 30, 60);
        /**
         * Cable e internet
         */
        doc.text(`Cable e internet:`, 20, 70);
        doc.text(`S/${datos.cabInt_piso1}`, 30, 75);

    }else{
        let accJSON,    luz,        agua,
            gas,        totalPiso;
        /**
         * Título
         */
        doc.text(`Departamento ${piso}`, 63, 10, 'center');
        doc.text(`${getNombreMes(datos.calculo_mes)}/${datos.calculo_anio}`, 63, 15, 'center');
        /**
         * Luz
         */
        doc.text(`Luz:`, 20, 25);
        accJSON = "medidor_pasado_departamento" + piso;
        let num1 = datos[accJSON];
        doc.text(`${num1} -> Mes anterior`, 30, 30);
        accJSON = "medidor_actual_departamento" + piso;
        let num2 = datos[accJSON];
        doc.text(`${num2} -> Mes actual`, 30, 35);
        doc.line(29, 36, 53, 36);   //LINE
        num1 = (parseFloat(num2)-parseFloat(num1)).toFixed(2);//Resta
        doc.text(`${num1}`, 35, 40);
        num2 = datos.valor_kw;//KW
        doc.text(`x ${num2} -> KW`, 25, 45);
        doc.line(29, 46, 53, 46);   //LINE
        num1 = (num1 * parseFloat(num2)).toFixed(2);
        doc.text(`${num1}`, 35, 50);
        num2 = (0.18 * num1).toFixed(2);//18%
        doc.text(`${num2} -> 18%`, 38, 55);
        doc.line(29, 56, 53, 56);   //LINE
        num1 = (num1*1.0 + num2*1.0).toFixed(2);
        doc.text(`${num1}`, 35, 60);
        num2 = datos.alumbrado_publico; //Alumbrado público
        doc.text(`${num2} -> A. público`, 38, 65);
        doc.line(29, 66, 53, 66);   //LINE
        num1 = (num1*1.0 + num2*1.0).toFixed(2);
        doc.text(`${num1} -> Total Luz`, 35, 70); //Total luz
        luz = num1;
        accJSON = "departamento" + piso;
        totalesLuz[accJSON] = luz;
        /**
         * Agua
         */
        doc.text(`Agua:`, 10, 80);
        num1 = datos.total_agua;
        num2 = (num1/getTotalPersonas()).toFixed(2);
        doc.text(`${num1} ${String.fromCharCode(247)} ${getTotalPersonas()} = S/${num2}`, 20, 85);
        accJSON = "personas_departamento" + piso;
        num1 = (num2 * datos[accJSON]).toFixed(2);
        doc.text(`${num2} x ${datos[accJSON]} = S/${num1} -> T. Agua`, 20, 90);
        agua = num1;
        /**
         * Gas
         */
        accJSON = "gas_departamento" + piso;
        gas = datos[accJSON];
        totalPiso = agua*1 + gas*1 + luz*1;
        /**
         * Resumen
         */
        doc.text(`Resumen`, 63, 100, 'center');
        doc.rect(10, 101, 105, 20);
        doc.text(`Agua + Luz + Gas`, 63, 105, 'center');
        doc.text(`${agua} + ${luz} + ${gas}`, 63, 110, 'center');
        doc.setFontType("bold");
        doc.text(`S/${Math.round(totalPiso)}.00`, 63, 115, 'center');



        //let accJSON = "personas_departamento" + piso;
        //doc.text(`Departamento ${piso}: ` + datos[accJSON], 5, 50);
    }
    /*doc.text("Departamento 2A: " + datos[personas_departamento2A] , 5, 15);
    doc.text("Departamento 2B: " + datos.personas_departamento2B, 5, 20);
    doc.text("Departamento 3A: " + datos.personas_departamento3A, 5, 25);
    doc.text("Departamento 3B: " + datos.personas_departamento3B, 5, 30);*/

    return doc;
}

function gestionarPDFs(){
    let pdf = generarPDF("2A");
    document.getElementById('iframe_departamento2A').setAttribute('src', pdf.output('bloburl'));
    pdf = generarPDF("2B");
    document.getElementById('iframe_departamento2B').setAttribute('src', pdf.output('bloburl'));
    pdf = generarPDF("3A");
    document.getElementById('iframe_departamento3A').setAttribute('src', pdf.output('bloburl'));
    pdf = generarPDF("3B");
    document.getElementById('iframe_departamento3B').setAttribute('src', pdf.output('bloburl'));
    pdf = generarPDF("1");
    document.getElementById('iframe_piso1').setAttribute('src', pdf.output('bloburl'));
}

function descargarPDF(piso){
    let doc = generarPDF(piso);
    let now = new Date();
    if(piso == '1'){
        doc.save(`Piso ${piso}_${now.getSeconds()}${now.getMinutes()}${now.getHours()}${now.getDate()}${now.getMonth()}${now.getFullYear()}.pdf`);
    }else{
        doc.save(`Departamento ${piso}_${now.getSeconds()}${now.getMinutes()}${now.getHours()}${now.getDate()}${now.getMonth()}${now.getFullYear()}.pdf`);
    }
}


/**
 * Funciones de apoyo
 */
function getNombreMes(mes){
    let nombreMeses = {
        1: "Enero",
        2: "Febrero",
        3: "Marzo",
        4: "Abril",
        5: "Mayo",
        6: "Junio",
        7: "Julio",
        8: "Agosto",
        9: "Septiembre",
        10: "Octubre",
        11: "Noviembre",
        12: "Diciembre",
    };
    return nombreMeses[mes];
}

function getTotalPersonas(){
    return datos.personas_piso1*1 + datos.personas_departamento2A*1 + datos.personas_departamento2B*1
        + datos.personas_departamento3A*1 + datos.personas_departamento3B*1;
}

function getTotalLuzDep(){
    return totalesLuz.departamento2A*1 + totalesLuz.departamento2B*1 + totalesLuz.departamento3A*1
        + totalesLuz.departamento3B*1
}