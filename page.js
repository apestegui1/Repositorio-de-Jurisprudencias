import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  ShieldCheck, 
  Video, 
  Play, 
  Plus, 
  Clock, 
  FileText, 
  Building2, 
  Calendar, 
  UserCheck, 
  LogOut, 
  Filter, 
  X, 
  CheckCircle2, 
  Gavel,
  ChevronRight,
  Info
} from 'lucide-react';

// Datos de prueba precargados con jurisprudencia y Sedes de Misiones
const INITIAL_AUDIENCIAS = [
  {
    id: "aud-101",
    numero_causa: "Expte. N° 1420/2026",
    sede_tribunal: "Juzgado de Instrucción N° 2 - Posadas",
    tipo_audiencia: "Prisión Preventiva",
    fecha_audiencia: "2026-09-15",
    caratula: "Fiscalía de Instrucción c/ Gómez, Carlos Daniel s/ Robo Calificado por Uso de Arma",
    youtube_video_id: "L_LUpnjgPso", // ID público demostrativo
    duracion_segundos: 2400,
    transcripciones: [
      { id: "t-101-1", texto: "El Ministerio Público Fiscal solicita la prórroga de la prisión preventiva fundado en el riesgo procesal de entorpecimiento de la investigación.", inicio: 15, fin: 45 },
      { id: "t-101-2", texto: "Se constató en el expediente la falta de arraigo domiciliario verificado en la ciudad de Posadas.", inicio: 82, fin: 110 },
      { id: "t-101-3", texto: "La defensa técnica rechaza la prórroga de prisión preventiva y solicita como alternativa el arresto domiciliario con tobillera electrónica.", inicio: 210, fin: 245 }
    ]
  },
  {
    id: "aud-102",
    numero_causa: "Expte. N° 0899/2026",
    sede_tribunal: "Tribunal Penal N° 1 - Oberá",
    tipo_audiencia: "Arresto Domiciliario",
    fecha_audiencia: "2026-09-28",
    caratula: "Incidente de Morigeración de la Pena en causa Pérez, Juan s/ Estafa Generada",
    youtube_video_id: "dQw4w9WgXcQ",
    duracion_segundos: 1800,
    transcripciones: [
      { id: "t-102-1", texto: "Inicia la evaluación formal del pedido de arresto domiciliario amparado en razones de salud acreditadas por el Cuerpo Médico Forense.", inicio: 25, fin: 58 },
      { id: "t-102-2", texto: "El informe psicosocial obrante en autos confirma las condiciones edilicias óptimas para el cumplimiento del arresto domiciliario en la localidad de Oberá.", inicio: 140, fin: 178 }
    ]
  },
  {
    id: "aud-103",
    numero_causa: "Expte. N° 3312/2026",
    sede_tribunal: "Juzgado de Instrucción N° 1 - Eldorado",
    tipo_audiencia: "Control de Detención",
    fecha_audiencia: "2026-10-02",
    caratula: "Averiguación de Ilícito c/ Imputado en Causa N° 3312",
    youtube_video_id: "3JZ_D3ELwOQ",
    duracion_segundos: 1500,
    transcripciones: [
      { id: "t-103-1", texto: "Sustanciación del control de detención formal. Se constatan los plazos legales de aprehensión previa sin irregularidades procedimentales.", inicio: 10, fin: 35 },
      { id: "t-103-2", texto: "La fiscalía requiere la conversión de la detención en prisión preventiva debido a la pena en expectativa.", inicio: 95, fin: 130 }
    ]
  },
  {
    id: "aud-104",
    numero_causa: "Expte. N° 0451/2026",
    sede_tribunal: "Juzgado de Garantías - Puerto Iguazú",
    tipo_audiencia: "Excarcelación",
    fecha_audiencia: "2026-10-08",
    caratula: "Solicitud de Excarcelación bajo Caucional Real en causa s/ Contrabando",
    youtube_video_id: "L_LUpnjgPso",
    duracion_segundos: 2100,
    transcripciones: [
      { id: "t-104-1", texto: "Se fija caución real de sustitución y se analiza conceder la excarcelación bajo apercibimiento de revocación inmediata.", inicio: 40, fin: 75 },
      { id: "t-104-2", texto: "Condiciones impuestas: presentación quincenal ante la comisaría jurisdiccional de Puerto Iguazú y prohibición de salida de la provincia de Misiones.", inicio: 185, fin: 220 }
    ]
  }
];

export default function App() {
  // Estado de Autenticación
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userCredentials, setUserCredentials] = useState({ username: 'magistrado.misiones', password: '' });
  const [loginError, setLoginError] = useState('');

  // Estado de Datos
  const [audiencias, setAudiencias] = useState(INITIAL_AUDIENCIAS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSede, setFilterSede] = useState('TODAS');
  const [filterTipo, setFilterTipo] = useState('TODOS');

  // Estado del Video Activo
  const [activeVideo, setActiveVideo] = useState({
    videoId: INITIAL_AUDIENCIAS[0].youtube_video_id,
    timestamp: INITIAL_AUDIENCIAS[0].transcripciones[0].inicio,
    caratula: INITIAL_AUDIENCIAS[0].caratula,
    causa: INITIAL_AUDIENCIAS[0].numero_causa,
    sede: INITIAL_AUDIENCIAS[0].sede_tribunal,
    textoActual: INITIAL_AUDIENCIAS[0].transcripciones[0].texto
  });

  // Estado Modal de Registro
  const [showModal, setShowModal] = useState(false);
  const [newAudiencia, setNewAudiencia] = useState({
    numero_causa: '',
    sede_tribunal: 'Juzgado de Instrucción N° 2 - Posadas',
    tipo_audiencia: 'Prisión Preventiva',
    fecha_audiencia: new Date().toISOString().split('T')[0],
    caratula: '',
    youtube_video_id: '',
    transcripcionTexto: '',
    minutoInicio: '00:30'
  });

  // Simulación de Login
  const handleLogin = (e) => {
    e.preventDefault();
    if (userCredentials.username.trim().length > 0) {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Por favor complete los datos de acceso.');
    }
  };

  // Convertir timestamp string (MM:SS) a segundos
  const parseTimeToSeconds = (timeStr) => {
    if (typeof timeStr === 'number') return timeStr;
    const parts = timeStr.split(':');
    if (parts.length === 2) {
      return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
    }
    return 0;
  };

  // Formatear segundos a MM:SS
  const formatSecondsToMMSS = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = Math.floor(totalSeconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Filtrado de búsquedas
  const resultadosFiltrados = [];
  audiencias.forEach((aud) => {
    if (filterSede !== 'TODAS' && aud.sede_tribunal !== filterSede) return;
    if (filterTipo !== 'TODOS' && aud.tipo_audiencia !== filterTipo) return;

    aud.transcripciones.forEach((tr) => {
      const q = searchQuery.toLowerCase().trim();
      const matchTexto = q === '' || tr.texto.toLowerCase().includes(q);
      const matchCausa = q === '' || aud.numero_causa.toLowerCase().includes(q);
      const matchCaratula = q === '' || aud.caratula.toLowerCase().includes(q);

      if (matchTexto || matchCausa || matchCaratula) {
        resultadosFiltrados.push({
          audienciaId: aud.id,
          numero_causa: aud.numero_causa,
          sede_tribunal: aud.sede_tribunal,
          tipo_audiencia: aud.tipo_audiencia,
          fecha_audiencia: aud.fecha_audiencia,
          caratula: aud.caratula,
          youtube_video_id: aud.youtube_video_id,
          transcripcionId: tr.id,
          texto: tr.texto,
          inicio: tr.inicio,
          fin: tr.fin
        });
      }
    });
  });

  // Manejo de Reproducción en Minuto Exacto
  const handlePlayTimestamp = (item) => {
    setActiveVideo({
      videoId: item.youtube_video_id,
      timestamp: item.inicio,
      caratula: item.caratula,
      causa: item.numero_causa,
      sede: item.sede_tribunal,
      textoActual: item.texto
    });
  };

  // Guardar nueva audiencia
  const handleSaveAudiencia = (e) => {
    e.preventDefault();
    if (!newAudiencia.numero_causa || !newAudiencia.youtube_video_id || !newAudiencia.transcripcionTexto) {
      alert("Por favor complete los campos requeridos con asterisco (*)");
      return;
    }

    const segundosInicio = parseTimeToSeconds(newAudiencia.minutoInicio);

    const nuevaAudienciaObj = {
      id: `aud-${Date.now()}`,
      numero_causa: newAudiencia.numero_causa,
      sede_tribunal: newAudiencia.sede_tribunal,
      tipo_audiencia: newAudiencia.tipo_audiencia,
      fecha_audiencia: newAudiencia.fecha_audiencia,
      caratula: newAudiencia.caratula || "Sin carátula registrada",
      youtube_video_id: newAudiencia.youtube_video_id,
      duracion_segundos: 1800,
      transcripciones: [
        {
          id: `t-${Date.now()}-1`,
          texto: newAudiencia.transcripcionTexto,
          inicio: segundosInicio,
          fin: segundosInicio + 30
        }
      ]
    };

    setAudiencias([nuevaAudienciaObj, ...audiencias]);
    setShowModal(false);
    
    // Activar inmediatamente en el reproductor la nueva audiencia
    setActiveVideo({
      videoId: nuevaAudienciaObj.youtube_video_id,
      timestamp: segundosInicio,
      caratula: nuevaAudienciaObj.caratula,
      causa: nuevaAudienciaObj.numero_causa,
      sede: nuevaAudienciaObj.sede_tribunal,
      textoActual: newAudiencia.transcripcionTexto
    });

    // Resetear formulario
    setNewAudiencia({
      numero_causa: '',
      sede_tribunal: 'Juzgado de Instrucción N° 2 - Posadas',
      tipo_audiencia: 'Prisión Preventiva',
      fecha_audiencia: new Date().toISOString().split('T')[0],
      caratula: '',
      youtube_video_id: '',
      transcripcionTexto: '',
      minutoInicio: '00:30'
    });
  };

  // 1. PANTALLA DE LOGIN / AUTENTICACIÓN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans text-slate-100 relative overflow-hidden">
        {/* Efecto de luz de fondo */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 mb-4 shadow-inner">
              <Gavel className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Repositorio Judicial</h1>
            <p className="text-xs text-slate-400 mt-1.5">Poder Judicial - Sistema de Actas y Marcación de Audiencias</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-xs text-red-400">
                {loginError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Usuario Institucional</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <UserCheck className="w-4 h-4" />
                </span>
                <input 
                  type="text" 
                  value={userCredentials.username}
                  onChange={(e) => setUserCredentials({ ...userCredentials, username: e.target.value })}
                  placeholder="ej. magistrado.misiones" 
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Clave de Acceso</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <ShieldCheck className="w-4 h-4" />
                </span>
                <input 
                  type="password" 
                  value={userCredentials.password}
                  onChange={(e) => setUserCredentials({ ...userCredentials, password: e.target.value })}
                  placeholder="••••••••••••" 
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-lg shadow-lg shadow-blue-600/20 transition duration-200 mt-2 flex items-center justify-center space-x-2"
            >
              <span>Ingresar al Repositorio</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-800/80 text-center">
            <p className="text-[11px] text-slate-500">
              Acceso protegido. Autenticación auditada según resolución del Superior Tribunal.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 2. APLICACIÓN PRINCIPAL
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* HEADER DE LA APLICACIÓN */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-600/30">
            <Gavel className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white flex items-center space-x-2">
              <span>Repositorio de Audiencias Judiciales</span>
              <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                Misiones
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">Búsqueda por marcas de tiempo en videos grabados</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-md shadow-blue-600/20 transition flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Audiencia</span>
          </button>
          <div className="h-5 w-px bg-slate-800"></div>
          <button 
            onClick={() => setIsAuthenticated(false)}
            className="text-xs text-slate-400 hover:text-red-400 font-medium transition flex items-center space-x-1.5"
            title="Cerrar sesión segura"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </header>

      {/* CUERPO PRINCIPAL (2 COLUMNAS RESPONSIVAS) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* COLUMNA IZQUIERDA: BÚSQUEDA Y LISTA DE TRANSCRIPCIONES */}
        <main className="flex-1 flex flex-col p-6 overflow-y-auto max-w-5xl mx-auto w-full">
          
          {/* BUSCADOR + FILTROS */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm mb-6 space-y-4">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Search className="w-5 h-5" />
              </span>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar frase exacta o concepto (ej. prisión preventiva, arresto domiciliario, excarcelación...)" 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center space-x-1">
                  <Building2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Sede Judicial</span>
                </label>
                <select 
                  value={filterSede}
                  onChange={(e) => setFilterSede(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="TODAS">Todas las Sedes de Misiones</option>
                  <option value="Juzgado de Instrucción N° 2 - Posadas">Juzgado de Instrucción N° 2 - Posadas</option>
                  <option value="Tribunal Penal N° 1 - Oberá">Tribunal Penal N° 1 - Oberá</option>
                  <option value="Juzgado de Instrucción N° 1 - Eldorado">Juzgado de Instrucción N° 1 - Eldorado</option>
                  <option value="Juzgado de Garantías - Puerto Iguazú">Juzgado de Garantías - Puerto Iguazú</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center space-x-1">
                  <Filter className="w-3.5 h-3.5 text-blue-400" />
                  <span>Tipo de Audiencia</span>
                </label>
                <select 
                  value={filterTipo}
                  onChange={(e) => setFilterTipo(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="TODOS">Todos los Tipos de Audiencia</option>
                  <option value="Prisión Preventiva">Prisión Preventiva</option>
                  <option value="Arresto Domiciliario">Arresto Domiciliario</option>
                  <option value="Control de Detención">Control de Detención</option>
                  <option value="Excarcelación">Excarcelación</option>
                </select>
              </div>
            </div>
          </div>

          {/* RESULTADOS OBTENIDOS */}
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
              <span>Coincidencias encontradas</span>
              <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full text-[10px]">
                {resultadosFiltrados.length}
              </span>
            </h2>
            <span className="text-[11px] text-slate-500">Haga clic en la marca de tiempo para saltar al minuto</span>
          </div>

          {/* LISTA DE FRAGMENTOS Y AUDIENCIAS */}
          <div className="space-y-3.5">
            {resultadosFiltrados.length === 0 ? (
              <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-12 text-center text-slate-500">
                <Info className="w-10 h-10 mx-auto mb-3 opacity-40 text-blue-400" />
                <p className="text-sm font-semibold text-slate-300">No se hallaron fragmentos textuales para esta búsqueda.</p>
                <p className="text-xs text-slate-500 mt-1">Pruebe ajustando los filtros o utilizando otros términos como "prisión", "excarcelación" o "domiciliario".</p>
              </div>
            ) : (
              resultadosFiltrados.map((item, index) => {
                const isActive = activeVideo.videoId === item.youtube_video_id && activeVideo.timestamp === item.inicio;

                return (
                  <div 
                    key={`${item.audienciaId}-${item.transcripcionId}-${index}`}
                    className={`bg-slate-900 border rounded-2xl p-4.5 transition-all duration-200 ${
                      isActive ? 'border-blue-500 ring-1 ring-blue-500/30 shadow-lg bg-slate-900/90' : 'border-slate-800/90 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="bg-blue-600/10 text-blue-400 border border-blue-500/20 text-xs font-bold px-2.5 py-0.5 rounded-md">
                          {item.numero_causa}
                        </span>
                        <span className="text-xs font-medium text-slate-400 flex items-center space-x-1">
                          <Building2 className="w-3 h-3 text-slate-500" />
                          <span>{item.sede_tribunal}</span>
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 text-xs text-slate-400 shrink-0">
                        <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[11px]">
                          {item.tipo_audiencia}
                        </span>
                        <span className="flex items-center space-x-1 text-slate-500 text-[11px]">
                          <Calendar className="w-3 h-3" />
                          <span>{item.fecha_audiencia}</span>
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 font-medium mb-3 italic bg-slate-950/40 p-2 rounded-lg border border-slate-800/40">
                      Carátula: "{item.caratula}"
                    </p>

                    <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex items-start space-x-2.5">
                        <FileText className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                        <p className="text-xs leading-relaxed text-slate-200">
                          {item.texto}
                        </p>
                      </div>

                      <button 
                        onClick={() => handlePlayTimestamp(item)}
                        className={`inline-flex items-center justify-center space-x-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg transition shrink-0 ${
                          isActive 
                            ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30' 
                            : 'bg-blue-600 hover:bg-blue-500 text-white'
                        }`}
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>[{formatSecondsToMMSS(item.inicio)}] Reproducir</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </main>

        {/* COLUMNA DERECHA: REPRODUCTOR DE YOUTUBE EMBEBIDO CON SINCRONIZACIÓN */}
        <aside className="w-full lg:w-[440px] bg-slate-900 border-l border-slate-800 p-6 flex flex-col shrink-0">
          <div className="mb-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
              <Video className="w-4 h-4 text-blue-400" />
              <span>Reproductor de Video Sincronizado</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Sincronización automática de minutero con YouTube</p>
          </div>

          {/* IFRAME YOUTUBE */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl aspect-video flex items-center justify-center relative mb-4">
            {activeVideo.videoId ? (
              <iframe 
                key={`${activeVideo.videoId}-${activeVideo.timestamp}`}
                className="w-full h-full"
                src={`https://www.youtube-nocookie.com/embed/${activeVideo.videoId}?autoplay=1&start=${Math.floor(activeVideo.timestamp)}`}
                title="Reproducción de Audiencia"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : (
              <div className="text-center p-6 text-slate-600">
                <Video className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-xs font-medium">Seleccione una audiencia para ver el video.</p>
              </div>
            )}
          </div>

          {/* METADATOS DEL FRAGMENTO ACTUAL EN REPRODUCCIÓN */}
          <div className="bg-slate-950 border border-slate-800/90 rounded-xl p-4 text-xs space-y-2.5 mb-4">
            <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
              <span className="text-slate-400 font-semibold">Causa Seleccionada:</span>
              <span className="text-blue-400 font-bold">{activeVideo.causa}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block mb-0.5">Sede Judicial:</span>
              <span className="text-slate-200 font-medium">{activeVideo.sede}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block mb-0.5">Carátula:</span>
              <span className="text-slate-300 font-normal italic leading-tight block">{activeVideo.caratula}</span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-slate-800/80">
              <span className="text-slate-400 font-semibold">Minuto Exacto de Salto:</span>
              <span className="bg-blue-600/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded font-mono font-bold">
                {formatSecondsToMMSS(activeVideo.timestamp)}
              </span>
            </div>
          </div>

          {/* TEXTO DEL FRAGMENTO ACTIVO */}
          <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-3.5 mb-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Transcripción en esa posición</span>
            <p className="text-xs text-slate-300 italic leading-relaxed">
              "{activeVideo.textoActual}"
            </p>
          </div>

          <div className="mt-auto pt-4 border-t border-slate-800 text-[11px] text-slate-500 leading-normal flex items-start space-x-2">
            <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <span>Almacenamiento seguro en YouTube (videos no listados). Los registros se enlazan con Supabase PostgreSQL.</span>
          </div>
        </aside>

      </div>

      {/* MODAL DE REGISTRO DE NUEVA AUDIENCIA */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Cargar Nueva Audiencia</h3>
                <p className="text-xs text-slate-400">Vincula el video de YouTube con los fragmentos de transcripción</p>
              </div>
            </div>

            <form onSubmit={handleSaveAudiencia} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 uppercase mb-1">Número de Causa *</label>
                <input 
                  type="text" 
                  value={newAudiencia.numero_causa}
                  onChange={(e) => setNewAudiencia({ ...newAudiencia, numero_causa: e.target.value })}
                  placeholder="ej. Expte. N° 4510/2026"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 uppercase mb-1">Sede Tribunal</label>
                  <select 
                    value={newAudiencia.sede_tribunal}
                    onChange={(e) => setNewAudiencia({ ...newAudiencia, sede_tribunal: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Juzgado de Instrucción N° 2 - Posadas">Juzgado de Instrucción N° 2 - Posadas</option>
                    <option value="Tribunal Penal N° 1 - Oberá">Tribunal Penal N° 1 - Oberá</option>
                    <option value="Juzgado de Instrucción N° 1 - Eldorado">Juzgado de Instrucción N° 1 - Eldorado</option>
                    <option value="Juzgado de Garantías - Puerto Iguazú">Juzgado de Garantías - Puerto Iguazú</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 uppercase mb-1">Tipo de Audiencia</label>
                  <select 
                    value={newAudiencia.tipo_audiencia}
                    onChange={(e) => setNewAudiencia({ ...newAudiencia, tipo_audiencia: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Prisión Preventiva">Prisión Preventiva</option>
                    <option value="Arresto Domiciliario">Arresto Domiciliario</option>
                    <option value="Control de Detención">Control de Detención</option>
                    <option value="Excarcelación">Excarcelación</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 uppercase mb-1">Fecha Audiencia</label>
                  <input 
                    type="date" 
                    value={newAudiencia.fecha_audiencia}
                    onChange={(e) => setNewAudiencia({ ...newAudiencia, fecha_audiencia: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 uppercase mb-1">ID Video YouTube *</label>
                  <input 
                    type="text" 
                    value={newAudiencia.youtube_video_id}
                    onChange={(e) => setNewAudiencia({ ...newAudiencia, youtube_video_id: e.target.value })}
                    placeholder="ej. L_LUpnjgPso"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 uppercase mb-1">Carátula Expediente</label>
                <input 
                  type="text" 
                  value={newAudiencia.caratula}
                  onChange={(e) => setNewAudiencia({ ...newAudiencia, caratula: e.target.value })}
                  placeholder="ej. Ministerio Público c/ Ramírez s/ Hurto en Grado de Tentativa"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-300 uppercase mb-1">Fragmento de Transcripción *</label>
                  <textarea 
                    rows="2"
                    value={newAudiencia.transcripcionTexto}
                    onChange={(e) => setNewAudiencia({ ...newAudiencia, transcripcionTexto: e.target.value })}
                    placeholder="Ingrese la cita o frase relevante..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  ></textarea>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 uppercase mb-1">Minuto (MM:SS)</label>
                  <input 
                    type="text" 
                    value={newAudiencia.minutoInicio}
                    onChange={(e) => setNewAudiencia({ ...newAudiencia, minutoInicio: e.target.value })}
                    placeholder="ej. 02:15"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium px-4 py-2 rounded-lg transition"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-5 py-2 rounded-lg shadow-md transition"
                >
                  Guardar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}