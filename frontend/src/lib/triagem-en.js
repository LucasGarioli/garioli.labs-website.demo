//! Questionário de triagem em inglês — gerado a partir de `backend/src/triagem.rs`.
//!
//! O backend de demonstração roda no navegador e precisa responder o mesmo
//! questionário que a API Axum responde. A chave da resposta (`val`) nunca é
//! traduzida: é ela que a classificação compara e que fica gravada. O que muda
//! é só o que a pessoa lê.

/** Trilho, título e dica de cada pergunta, pela chave da pergunta. */
const PERGUNTAS_EN = {
  'tipo': { rail: 'Type of space', title: 'What kind of space is it?', hint: 'Pick the closest match. If it sits between two, choose the main use.' },
  'dor': { rail: 'What bothers you', title: 'What bothers you most today?', hint: 'Tick everything that happens. You do not need the technical name for it.' },
  'area': { rail: 'Size', title: 'Roughly how big is it?', hint: 'A range is enough. If you do not know, pick the last option — we measure it.' },
  'altura': { rail: 'Ceiling height', title: 'And the ceiling height?', hint: 'Compare it with what you know: an ordinary house is about 2.5 m.' },
  'lugares': { rail: 'Audience', title: 'How many people does the space hold?', hint: 'The typical attendance, not the maximum on the licence.' },
  'existe': { rail: 'What is already there', title: 'What is already installed?', hint: 'Tick whatever exists, even if it is old or faulty. Reusing it lowers the investment.' },
  'quer': { rail: 'What to quote', title: 'What would you like quoted?', hint: 'You can tick more than one. If you are not sure, tick the last option.' },
  'prazo': { rail: 'Timing', title: 'When do you plan to build?', hint: 'This sets the project queue, not the price.' },
  'docs': { rail: 'Documents', title: 'Do you have drawings or measurements?', hint: 'Not required. With drawings, the project starts sooner.' },
  'contato': { rail: 'Contact', title: 'Where do we send the answer?', hint: 'We use these details only to answer this request.' },
  'revisao': { rail: 'Review', title: 'Check before sending', hint: 'Review what you told us. You can change any answer.' }
};

/** Rótulo e descrição de cada opção, pela chave da resposta. */
const OPCOES_EN = {
  'Igreja ou templo': { label: 'Church or temple', desc: 'Worship, live music, amplified speech' },
  'Auditório ou teatro': { label: 'Auditorium or theatre', desc: 'Lectures, performances, events' },
  'Estúdio ou home studio': { label: 'Studio or home studio', desc: 'Recording, mixing, production' },
  'Sala de aula ou treinamento': { label: 'Classroom or training room', desc: 'In-person or hybrid teaching' },
  'Comércio ou academia': { label: 'Retail or gym', desc: 'Shop, restaurant, bar, gym' },
  'Outro uso': { label: 'Another use', desc: 'Describe it later in the contact step' },
  'Não se entende o que é falado': { label: 'Speech is hard to understand', desc: 'It arrives blurred, mostly at the back' },
  'O som ecoa muito': { label: 'The room echoes', desc: 'A tail hangs after every word or note' },
  'Microfonia': { label: 'Feedback', desc: 'That high squeal when the volume goes up' },
  'Volume alto e cansativo': { label: 'Loud and tiring', desc: 'You have to shout, and everyone leaves with a headache' },
  'Barulho passa entre ambientes': { label: 'Noise passes between rooms', desc: 'One room hears the other' },
  'Vizinhos reclamam': { label: 'Neighbours complain', desc: 'The sound leaves the building' },
  'Ainda não existe nada instalado': { label: 'Nothing installed yet', desc: 'New space or under construction' },
  'Até 50 m²': { label: 'Up to 50 m²', desc: 'An ordinary room' },
  '50 a 120 m²': { label: '50 to 120 m²', desc: 'Large room or small hall' },
  '120 a 300 m²': { label: '120 to 300 m²', desc: 'Medium hall' },
  '300 a 600 m²': { label: '300 to 600 m²', desc: 'Large hall' },
  'Mais de 600 m²': { label: 'Over 600 m²', desc: 'Sports hall, large temple, warehouse' },
  'Não sei': { label: 'I do not know', desc: 'We measure it on the site visit' },
  'Baixo, como uma casa': { label: 'Low, like a house', desc: 'About 2.5 m' },
  'Médio': { label: 'Medium', desc: 'Between 3 and 4 m' },
  'Alto': { label: 'High', desc: 'Between 4 and 7 m' },
  'Muito alto': { label: 'Very high', desc: 'Over 7 m, or double height' },
  'Até 30 pessoas': { label: 'Up to 30 people', desc: '' },
  '30 a 100 pessoas': { label: '30 to 100 people', desc: '' },
  '100 a 300 pessoas': { label: '100 to 300 people', desc: '' },
  '300 a 800 pessoas': { label: '300 to 800 people', desc: '' },
  'Mais de 800 pessoas': { label: 'Over 800 people', desc: '' },
  'Caixas de som': { label: 'Loudspeakers', desc: '' },
  'Mesa de som': { label: 'Mixing desk', desc: 'Analogue or digital' },
  'Microfones': { label: 'Microphones', desc: 'Wired or wireless' },
  'Projetor ou TV': { label: 'Projector or TV', desc: '' },
  'Iluminação de palco': { label: 'Stage lighting', desc: 'Beyond the room\'s own lamps' },
  'Tratamento acústico': { label: 'Acoustic treatment', desc: 'Foam, panels, technical curtains' },
  'Nada disso': { label: 'None of these', desc: 'Space with no equipment' },
  'Isolamento acústico': { label: 'Sound isolation', desc: 'Keep sound from getting in or out' },
  'Projeto de sonorização': { label: 'Sound system design', desc: 'Speakers, desk, microphones, signal flow' },
  'Projeto de iluminação': { label: 'Lighting design', desc: 'Stage and scenic light' },
  'Projeto de projeção ou vídeo': { label: 'Projection or video design', desc: 'Screens, projectors, cameras, streaming' },
  'Consultoria de compra': { label: 'Purchase consulting', desc: 'Guidance to buy without mistakes' },
  'Não sei, quero orientação': { label: 'I am not sure, I want guidance', desc: 'We diagnose it and recommend the route' },
  'O quanto antes': { label: 'As soon as possible', desc: 'Works under way or a date already booked' },
  'Em 1 a 3 meses': { label: 'In 1 to 3 months', desc: '' },
  'Em 3 a 6 meses': { label: 'In 3 to 6 months', desc: '' },
  'Ainda estudando': { label: 'Still considering', desc: 'I want to understand the investment before deciding' },
  'Tenho planta em PDF ou DWG': { label: 'I have drawings in PDF or DWG', desc: '' },
  'Tenho medidas anotadas': { label: 'I have measurements written down', desc: 'Width, length and height' },
  'Não tenho nada': { label: 'I have nothing', desc: 'We do the survey' },
  'Posso medir se me orientarem': { label: 'I can measure if you guide me', desc: 'We send a simple script' }
};

/** O mesmo esquema, com os textos de tela em inglês. */
export function traduzSchema(schema) {
  return schema.map((p) => ({
    ...p,
    ...(PERGUNTAS_EN[p.key] ?? {}),
    options: p.options.map((o) => ({ ...o, ...(OPCOES_EN[o.val] ?? {}) }))
  }));
}
