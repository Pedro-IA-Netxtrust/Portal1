"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { useTrabajadoresStore } from "@/store/trabajadores-store";
import { useControlStore } from "@/store/control-store";
import { Search, Filter, BookOpen, GraduationCap, Briefcase, Star, MapPin, ChevronRight, Download } from "lucide-react";
import TrabajadorDetalle from "@/components/custom/trabajador-detalle";

export default function TalentosPage() {
  const { trabajadores, fetchTrabajadores } = useTrabajadoresStore(
    useShallow((s) => ({ trabajadores: s.trabajadores, fetchTrabajadores: s.fetchTrabajadores }))
  );
  const { cursos, catalogoCursos, fetchControlData } = useControlStore(
    useShallow((s) => ({
      cursos: s.cursos,
      catalogoCursos: s.catalogoCursos,
      fetchControlData: s.fetchControlData,
    }))
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [filterExperiencia, setFilterExperiencia] = useState<"Todos" | "0-2" | "3-5" | "5+">("Todos");
  const [filterIdioma, setFilterIdioma] = useState<string>("Todos");

  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);

  useEffect(() => {
    fetchTrabajadores();
    fetchControlData();
  }, [fetchTrabajadores, fetchControlData]);

  // Extract all unique languages from all workers for the filter
  const availableIdiomas = useMemo(() => {
    const langs = new Set<string>();
    trabajadores.forEach(t => {
      t.idiomas?.forEach(i => langs.add(i));
    });
    return Array.from(langs).sort();
  }, [trabajadores]);

  // Filter workers based on criteria
  const filteredTalentos = useMemo(() => {
    return trabajadores.filter((t) => {
      // General text search (name, profession, skills)
      const query = searchQuery.toLowerCase();
      
      const userCursos = cursos.filter(c => c.id_trabajador === t.id_trabajador && c.estado === "Aprobado");

      const matchesText = 
        t.nombre_1.toLowerCase().includes(query) ||
        t.apellido_paterno.toLowerCase().includes(query) ||
        (t.profesion && t.profesion.toLowerCase().includes(query)) ||
        (t.institucion_educativa && t.institucion_educativa.toLowerCase().includes(query)) ||
        t.certificaciones_especificas?.some(c => c.toLowerCase().includes(query)) ||
        t.otras_habilidades?.some(h => h.toLowerCase().includes(query)) ||
        userCursos.some(c => {
          const cat = catalogoCursos.find(cat => cat.id === c.id_curso_catalogo);
          return cat ? cat.nombre.toLowerCase().includes(query) : false;
        });

      if (!matchesText) return false;

      // Experiencia filter
      if (filterExperiencia !== "Todos") {
        const exp = t.anos_experiencia || 0;
        if (filterExperiencia === "0-2" && exp > 2) return false;
        if (filterExperiencia === "3-5" && (exp < 3 || exp > 5)) return false;
        if (filterExperiencia === "5+" && exp <= 5) return false;
      }

      // Idioma filter
      if (filterIdioma !== "Todos") {
        if (!t.idiomas?.includes(filterIdioma)) return false;
      }

      return true;
    });
  }, [trabajadores, searchQuery, filterExperiencia, filterIdioma, cursos, catalogoCursos]);

  // Get initial letters for avatar
  const getInitials = (nombre: string, apellido: string) => {
    return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="p-8 space-y-8 animate-fadeIn max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text flex items-center gap-3">
            <Star className="text-primary" size={28} />
            Buscador de Talento Interno
          </h1>
          <p className="text-sm font-medium text-text-soft mt-1">
            Encuentra profesionales, habilidades y certificaciones dentro de la organización.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary py-2 text-xs">
            <Download size={14} /> Exportar
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="card p-5 space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input
            type="text"
            placeholder="Buscar por nombre, profesión, tecnología o certificación (Ej: Scrum, SAP, Ingeniero)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input w-full pl-11 py-3 text-sm font-medium bg-surface shadow-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 pt-2">
          <div className="flex items-center gap-2 text-text-muted text-xs font-bold uppercase tracking-wider mr-2">
            <Filter size={14} /> Filtros:
          </div>
          
          <select 
            value={filterExperiencia}
            onChange={(e) => setFilterExperiencia(e.target.value as "Todos" | "0-2" | "3-5" | "5+")}
            className="input py-2 text-xs min-h-0 w-auto bg-surface"
          >
            <option value="Todos">Experiencia: Todas</option>
            <option value="0-2">Junior (0-2 años)</option>
            <option value="3-5">Semi-Senior (3-5 años)</option>
            <option value="5+">Senior (+5 años)</option>
          </select>

          <select 
            value={filterIdioma}
            onChange={(e) => setFilterIdioma(e.target.value)}
            className="input py-2 text-xs min-h-0 w-auto bg-surface"
            disabled={availableIdiomas.length === 0}
          >
            <option value="Todos">Idioma: Todos</option>
            {availableIdiomas.map(lang => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
          
          <div className="ml-auto text-xs font-bold text-text-soft">
            <span className="text-primary font-extrabold">{filteredTalentos.length}</span> talentos encontrados
          </div>
        </div>
      </div>

      {/* Talent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTalentos.map((trabajador) => (
          <div key={trabajador.id_trabajador} className="card group hover:border-primary/40 transition-all flex flex-col p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-brand text-white flex items-center justify-center text-xl font-bold shadow-md shrink-0">
                {getInitials(trabajador.nombre_1, trabajador.apellido_paterno)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-text text-base truncate group-hover:text-primary transition-colors">
                  {trabajador.nombre_1} {trabajador.apellido_paterno}
                </h3>
                <p className="text-xs font-bold text-text-soft truncate mt-0.5">{trabajador.cargo || "Sin Cargo"}</p>
                <div className="flex items-center gap-1 text-[10px] text-text-muted font-semibold mt-1.5">
                  <MapPin size={10} /> {trabajador.ciudad || "No especificada"}
                </div>
              </div>
            </div>

            <div className="space-y-3 flex-1">
              {/* Education */}
              <div className="bg-surface-2 rounded-xl p-3 text-xs space-y-1.5 border border-border/50">
                <div className="flex items-start gap-2">
                  <GraduationCap size={12} className="text-primary shrink-0 mt-0.5" />
                  <span className="font-semibold text-text line-clamp-1">{trabajador.profesion || "Formación no especificada"}</span>
                </div>
                {trabajador.institucion_educativa && (
                  <div className="flex items-start gap-2">
                    <BookOpen size={12} className="text-text-muted shrink-0 mt-0.5" />
                    <span className="text-text-soft line-clamp-1">{trabajador.institucion_educativa}</span>
                  </div>
                )}
                {!!trabajador.anos_experiencia && (
                  <div className="flex items-start gap-2">
                    <Briefcase size={12} className="text-text-muted shrink-0 mt-0.5" />
                    <span className="text-text-soft font-medium">{trabajador.anos_experiencia} años de experiencia</span>
                  </div>
                )}
              </div>

              {/* Skills and Certifications */}
              {(() => {
                const certs = trabajador.certificaciones_especificas || [];
                const langs = trabajador.idiomas || [];
                const aprobados = cursos
                  .filter(c => c.id_trabajador === trabajador.id_trabajador && c.estado === "Aprobado")
                  .map(c => {
                    const cat = catalogoCursos.find(cat => cat.id === c.id_curso_catalogo);
                    return cat ? cat.nombre : "Curso Desconocido";
                  });
                const allTags = [...certs, ...aprobados];
                
                if (allTags.length === 0 && langs.length === 0) return null;

                return (
                  <div className="pt-2">
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-2">Habilidades Destacadas</span>
                    <div className="flex flex-wrap gap-1.5">
                      {allTags.slice(0, 3).map((tag, i) => (
                        <span key={i} className="badge bg-primary/10 text-primary border border-primary/20 text-[9px] px-2 py-0.5">
                          {tag}
                        </span>
                      ))}
                      {langs.slice(0, 2).map((lang, i) => (
                        <span key={`lang-${i}`} className="badge badge-outline text-[9px] px-2 py-0.5">
                          {lang}
                        </span>
                      ))}
                      {(allTags.length + langs.length > 5) && (
                        <span className="badge bg-surface-2 text-text-muted text-[9px] px-2 py-0.5">
                          +{(allTags.length + langs.length) - 5}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="mt-5 pt-4 border-t border-border flex justify-end">
              <button 
                onClick={() => setSelectedWorkerId(trabajador.id_trabajador)}
                className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1 transition-colors"
              >
                Ver Perfil Completo <ChevronRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredTalentos.length === 0 && (
        <div className="card p-12 text-center border-dashed flex flex-col items-center justify-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-surface-2 flex items-center justify-center text-text-muted mb-2">
            <Search size={24} />
          </div>
          <h4 className="text-text font-bold text-lg">No se encontraron perfiles</h4>
          <p className="text-text-soft text-sm max-w-md mx-auto">
            Intenta ajustar los filtros de búsqueda o prueba con diferentes términos como profesiones o certificaciones específicas.
          </p>
        </div>
      )}

      {/* Modal Profile Detalle */}
      {selectedWorkerId && (
        <TrabajadorDetalle 
          trabajador={trabajadores.find(t => t.id_trabajador === selectedWorkerId)!} 
          onClose={() => setSelectedWorkerId(null)} 
        />
      )}
    </div>
  );
}
