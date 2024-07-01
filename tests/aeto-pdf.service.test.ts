import { AetoPdfService } from "../src/aeto/aeto-pdf.service";
import { AETOEvent } from "../src/aeto/aeto.interface";
import {
  EXAMPLE_RAW_PDF_1,
  EXAMPLE_RAW_PDF_2,
} from "./aeto-pdf.service.test.constants";

describe("Aeto Pdf Service", () => {
  let pdfService: AetoPdfService;

  beforeEach(() => {
    pdfService = new AetoPdfService();
  });

  it("Should parse the structure of the pdf type 1", () => {
    const result = pdfService.getEventFromText(EXAMPLE_RAW_PDF_1);
    const expected: AETOEvent = {
      name: "Buceo en el Peñón del Cuervo",
      description:
        "Te proponemos un plan que no podrás resistir...., una actividad de iniciación al buceo en la que aprenderás a realizar inmersiones con todo el material profesional necesario para que sea inolvidable y disfrutes de esta increíble experiencia de manera segura. Seguro que la actividad te va a gustar tanto que vas a querer quedarte más tiempo buceando. Cuando consigas tu plaza es imprescindible que prestes atención a tu correo electrónico, ya que se te enviará un cuestionario pidiéndote los siguientes datos personales: talla de pie, altura, peso y tu dni para asegurarte que el equipo que te llevan te estará bien. No se admitirá ninguna información del equipo posterior a las 13:30h del jueves 18/07/24. ¡ATENCIÓN!, en esta actividad sólo podrás participar una vez este año y si no tienes ningún título oficial de buceo (excluido el de bautismo de buceo), en el caso de conseguir plaza te daremos de baja para que otras personas puedan disfrutar de esta actividad.",
      details:
        "Te recomendamos que lleves protector solar y algo ligero para picar. Es imprescindible que asistas con ropa de baño.",
      location: "Playa del Peñón del Cuervo https://g.co/kgs/Jheewvb",
      schedule:
        "- Recepción y presentación del grupo y monitores.\n- Charla previa en superficie, ajuste del material de inmersión.\n- Inmersión en el mar de unos cuarenta minutos.\n- Valoración de la actividad.",
      places: "Tres turnos de 10 plazas cada uno.",
      startDate: new Date("2024-07-19T07:00:00.000Z"),
      endDate: new Date("2024-07-19T08:30:00.000Z"),
    };

    expect(result).toEqual(expected);
  });

  it("Should parse the structure of the pdf type 2", () => {
    const result = pdfService.getEventFromText(EXAMPLE_RAW_PDF_2);
    const expected: AETOEvent = {
      name: "Juegos de Mesa",
      description:
        "¿Te apetece pasar unas horas divertidas? Pues no lo dudes, esta actividad está pensada para ti, te proponemos que pases unas horas divertidas descubriendo un gran número de juegos de diferentes tipos para que descubras cuál te gusta más. En esta actividad no sólo vas a descubrir el extenso mundo de los juegos de mesa, probar las últimas novedades, divertirte y conocer a más gente, sino que además participarás en el sorteo de unos juegos de mesa, no puedes perdértelo, ¡consigue tu plaza y demuestra tus habilidades!",
      details: "Se recomienda asistir con ropa y calzado cómodo.",
      location:
        "Instalaciones de La Máquina Imaginaria – Centro Comercial Málaga Ocio. Local 2, planta",
      schedule:
        "- Recepción y presentación de los participantes y monitores.\n- División de los participantes en grupos para probar los diferentes juegos.\n- Se sorteará un juego de mesa entre los asistentes.\n- Valoración de la actividad.",
      places: "Un único turno de 20 plazas.",
      startDate: new Date("2024-03-09T21:00:00.000Z"),
      endDate: new Date("2024-03-10T00:00:00.000Z"),
    };

    expect(result).toEqual(expected);
  });
});
