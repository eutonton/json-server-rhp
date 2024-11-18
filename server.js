const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

// Usar middlewares padrão do JSON Server
server.use(middlewares);
server.use(jsonServer.bodyParser);

// Rota de login
server.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = router.db.get('users').find({ username, password }).value();

  if (user) {
    res.json({ token: user.token });
  } else {
    res.status(401).json({ error: 'Credenciais inválidas' });
  }
});

// Consultar paciente pelo CPF
server.get('/patients/:cpf', (req, res) => {
  const patient = router.db.get('patients').find({ cpf: req.params.cpf }).value();

  if (patient) {
    res.json(patient);
  } else {
    res.status(404).json({ error: 'Paciente não encontrado' });
  }
});

// Cadastrar paciente
server.post('/patients', (req, res) => {
  const newPatient = req.body;

  if (!newPatient.cpf) {
    return res.status(400).json({ error: 'CPF é obrigatório' });
  }

  const existingPatient = router.db.get('patients').find({ cpf: newPatient.cpf }).value();

  if (existingPatient) {
    return res.status(409).json({ error: 'Paciente já cadastrado' });
  }

  router.db.get('patients').push(newPatient).write();
  res.status(201).json(newPatient);
});

// Alta hospitalar
server.patch('/patients/:id/alta', (req, res) => {
  const { id } = req.params;
  const patient = router.db.get('patients').find({ id: Number(id) }).value();

  if (!patient) {
    return res.status(404).json({ error: 'Paciente não encontrado' });
  }

  const updatedPatient = { ...patient, status: 'alta', bed: null, hospital: null };
  router.db.get('patients').find({ id: Number(id) }).assign(updatedPatient).write();

  res.json(updatedPatient);
});

// Transferência de leito
server.patch('/patients/:id/transfer', (req, res) => {
  const { id } = req.params;
  const { bed, hospital } = req.body;

  const patient = router.db.get('patients').find({ id: Number(id) }).value();

  if (!patient) {
    return res.status(404).json({ error: 'Paciente não encontrado' });
  }

  const updatedPatient = { ...patient, bed, hospital };
  router.db.get('patients').find({ id: Number(id) }).assign(updatedPatient).write();

  res.json(updatedPatient);
});

// Usar o roteador JSON Server padrão
server.use(router);

// Iniciar o servidor
server.listen(3000, () => {
  console.log('JSON Server está rodando na porta 3000');
});

