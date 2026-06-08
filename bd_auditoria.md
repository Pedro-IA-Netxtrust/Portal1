# Auditoria de BD - bd_trabajadores
_Generado:   |  **REVISAR: 119 items requieren atencion**

---

## Resumen General

| Metrica | Valor | Estado |
|---|---|---|
| Total registros en BD | 118 | -- |
| RUTs sin formato (sin . y -) | 115 | NORMALIZAR |
| RUTs con formato estandar | 3 | -- |
| RUTs con digito invalido | 0 | OK |
| RUTs duplicados | 0 | OK |
| Telefonos sin prefijo +56 | 114 | NORMALIZAR |
| Emails genericos | 1 | REVISAR |
| Emails PENDIENTE | 0 | OK |
| sexo = null | 1 | COMPLETAR |
| nacionalidad = null | 2 | COMPLETAR |
| cargo = null | 2 | REVISAR |

---

## Formato de RUT en la BD

> [!WARNING]
> Los RUTs en la BD estan almacenados SIN puntos ni guion (ej: `178313290`).
> El CSV usa formato estandar (ej: `17.831.329-0`).
> Se recomienda estandarizar la BD antes de reconciliar.

**Muestra de RUTs actuales en BD:**

| RUT en BD (actual) | Formato estandar |
|---|---|
| `204602506` | `20.460.250-6` |
| `178313290` | `17.831.329-0` |
| `137434091` | `13.743.409-1` |
| `170941934` | `17.094.193-4` |
| `86096781` | `8.609.678-1` |
| `145567025` | `14.556.702-5` |
| `191448529` | `19.144.852-9` |
| `79337102` | `7.933.710-2` |

Se genero `estandarizar_ruts_bd.sql` para corregir esto antes de importar.

---

## Campos Vacios / Null por Campo

| Campo | Registros vacios | % |
|---|---|---|
| `apellido_paterno` | 0 | 0% |
| `cargo` | 2 | 1.7% |
| `celular_personal` | 0 | 0% |
| `email_corporativo` | 0 | 0% |
| `fecha_ingreso` | 0 | 0% |
| `modalidad_trabajo` | 0 | 0% |
| `nacionalidad` | 2 | 1.7% |
| `nombre_1` | 0 | 0% |
| `numero_identificacion` | 0 | 0% |
| `sexo` | 1 | 0.8% |
| `tipo_contrato` | 0 | 0% |

### Registros con sexo vacio

| id_trabajador | Nombre | RUT |
|---|---|---|
| 83fb3d21-5d72-400c-9b4e-287ed3994de6 | Anderson Berna | 181829842 |

### Registros con nacionalidad vacia

| id_trabajador | Nombre | RUT |
|---|---|---|
| d9db14a2-c3ad-4d6c-bdb0-55e52e2758ef | Cristián Calderón | 160554193 |
| cb954fae-4a58-443f-af48-84279930605c | Alex Chocobar | 93107721 |

### Registros con cargo vacio

| id_trabajador | Nombre | RUT | email |
|---|---|---|---|
| 44aa0d8f-a52c-45a8-af6f-a4bde2e84fd6 | Josepedro Abbott | 204602506 | josepedro.abbott@monitoring.cl |
| 28de6e5d-56d3-424e-a593-6c4bd56f7b5e | Marjorie Callejas | 157694367 | null |

---

## Telefonos sin Prefijo +56

Total: **114** registros necesitan agregar +56

> El script `limpiar_bd.sql` corrige esto con: `UPDATE trabajadores SET celular_personal = '+56' || celular_personal`

**Muestra (primeros 5):**

| Nombre | Celular actual | Celular corregido |
|---|---|---|
| Josepedro Abbott | 999698783 | +56999698783 |
| Javier Altamirano | 974582608 | +56974582608 |
| Guillermo Alvarado | 955330526 | +56955330526 |
| Katherina Alvarado | 968721545 | +56968721545 |
| Carlos Alvear | 998788082 | +56998788082 |

---

## Emails que Requieren Revision

### Emails genericos (no personales)

| Nombre | Email actual |
|---|---|
| Claudia Augusto | soporte@monitoring.cl |

---

## Distribuciones de Datos

### Sexo
| Valor | Cantidad |
|---|---|
| M | 87 |
| F | 30 |
| (null) | 1 |

### Nacionalidad
| Valor | Cantidad |
|---|---|
| Chilena | 102 |
| Venezolana | 10 |
| (null) | 2 |
| Peruana | 2 |
| Boliviano | 1 |
| Boliviana | 1 |

### Tipo de Contrato
| Valor | Cantidad |
|---|---|
| Indefinido | 102 |
| Plazo Fijo | 13 |
| Honorarios | 3 |

### Modalidad de Trabajo
| Valor | Cantidad |
|---|---|
| Presencial | 118 |

---

## Lista Completa de la BD

| # | RUT Actual | Nombre Completo | Cargo | Contrato | Ingreso | Sexo | Nac. | RUT-DV |
|---|---|---|---|---|---|---|---|---|
| 1 | `204602506` | Josepedro Abbott | (sin cargo) | Honorarios | 2026-01-19 | M | Chile | OK |
| 2 | `178313290` | Javier Altamirano | Consultor | Indefinido | 2025-11-10 | M | Chile | OK |
| 3 | `137434091` | Guillermo Alvarado | Consultor | Indefinido | 2022-08-16 | M | Chile | OK |
| 4 | `170941934` | Katherina Alvarado | Consultor | Indefinido | 2025-10-27 | F | Chile | OK |
| 5 | `86096781` | Carlos Alvear | Consultor | Indefinido | 2019-11-25 | M | Chile | OK |
| 6 | `145567025` | Alfonso Anza | Consultor | Indefinido | 2022-08-29 | M | Chile | OK |
| 7 | `191448529` | Natalia Arias | Consultor | Plazo Fijo | 2026-04-01 | F | Chile | OK |
| 8 | `79337102` | Eduardo Arratia | Consultor | Indefinido | 2022-07-01 | M | Chile | OK |
| 9 | `219104251` | Claudia Augusto | Secretaria Administrativa | Indefinido | 2017-01-06 | F | Perua | OK |
| 10 | `138218953` | Claudio Avendaño | Consultor | Indefinido | 2023-05-15 | M | Chile | OK |
| 11 | `161558230` | Daniel Azúa | Consultor | Indefinido | 2022-08-22 | M | Chile | OK |
| 12 | `161007064` | Boris Badilla | Consultor | Indefinido | 2023-06-01 | M | Chile | OK |
| 13 | `158130378` | Enrique Baeza | APR | Indefinido | 2021-01-04 | M | Chile | OK |
| 14 | `96317115` | Sofía Barbera | Consultor | Indefinido | 2019-11-18 | F | Chile | OK |
| 15 | `198127531` | Cristian Bascur | Consultor | Indefinido | 2025-10-06 | M | Chile | OK |
| 16 | `181829842` | Anderson Berna | Consultor | Indefinido | 2025-11-03 | (null) | Chile | OK |
| 17 | `197880635` | Felipe Blanca | Consultor | Indefinido | 2024-04-15 | M | Chile | OK |
| 18 | `261864363` | Ana Blanco | Consultor | Indefinido | 2025-12-01 | F | Venez | OK |
| 19 | `183626698` | Fernando Bolados | Consultor | Indefinido | 2025-10-13 | M | Chile | OK |
| 20 | `144962176` | Bárbara Borja | Consultor | Indefinido | 2021-01-18 | F | Chile | OK |
| 21 | `158780054` | Valentina Bórquez | Consultor | Indefinido | 2019-10-14 | F | Chile | OK |
| 22 | `157524992` | Hugo Briceño | Consultor | Indefinido | 2021-09-06 | M | Chile | OK |
| 23 | `183622935` | Claudia Bugueño | Consultor | Indefinido | 2021-06-14 | F | Chile | OK |
| 24 | `160554193` | Cristián Calderón | Consultor | Indefinido | 2022-06-08 | M | (null) | OK |
| 25 | `157694367` | Marjorie Callejas | (sin cargo) | Honorarios | 2026-01-06 | F | Chile | OK |
| 26 | `15.969.541-7` | Alejandra Campos | APR | Indefinido | 2023-12-04 | F | Chile | OK |
| 27 | `119328934` | Lucinda Castillo | Consultor | Indefinido | 2022-11-07 | F | Chile | OK |
| 28 | `178158414` | Cristian Cataldo | Consultor | Plazo Fijo | 2026-03-02 | M | Chile | OK |
| 29 | `14.696.522-9` | José Chambi | Consultor | Indefinido | 2022-11-28 | M | Boliv | OK |
| 30 | `93107721` | Alex Chocobar | Consultor | Indefinido | 2021-06-23 | M | (null) | OK |
| 31 | `207341312` | Alexander Collants | Consultor | Indefinido | 2025-11-24 | M | Chile | OK |
| 32 | `162587641` | José Contreras | Consultor | Indefinido | 2024-10-01 | M | Chile | OK |
| 33 | `183525921` | Alex Cortés | Consultor | Indefinido | 2026-03-02 | M | Chile | OK |
| 34 | `141120611` | Cristian Cortés | Consultor | Plazo Fijo | 2026-03-12 | M | Chile | OK |
| 35 | `19463790K` | Javier Cortés | Consultor | Plazo Fijo | 2026-03-16 | M | Chile | OK |
| 36 | `200932056` | Karen Cortés | Consultor | Indefinido | 2025-11-17 | F | Chile | OK |
| 37 | `199285335` | Rodrigo Cuevas | Consultor | Indefinido | 2025-10-27 | M | Chile | OK |
| 38 | `136924362` | Rodrigo De la Cruz | Consultor | Indefinido | 2024-07-29 | M | Chile | OK |
| 39 | `259584442` | Fidel Delpino | Consultor | Indefinido | 2025-03-03 | M | Venez | OK |
| 40 | `168682115` | Cristian Díaz | Consultor | Plazo Fijo | 2025-12-15 | M | Chile | OK |
| 41 | `198673560` | Diego Díaz | Consultor | Plazo Fijo | 2026-04-01 | M | Chile | OK |
| 42 | `259361338` | Mario Díaz | Consultor | Indefinido | 2020-11-02 | M | Venez | OK |
| 43 | `182338818` | Karina Echeverría | Consultor | Indefinido | 2025-12-15 | F | Chile | OK |
| 44 | `188265138` | María Fernández | Consultor | Indefinido | 2025-01-06 | F | Chile | OK |
| 45 | `181492686` | Marco Flores | Consultor | Indefinido | 2025-10-13 | M | Chile | OK |
| 46 | `184002302` | Ricardo Flores | Consultor | Indefinido | 2025-11-10 | M | Chile | OK |
| 47 | `108359471` | Francisco Godoy | Consultor | Indefinido | 2023-12-11 | M | Chile | OK |
| 48 | `130078362` | Cristian González | Consultor | Indefinido | 2022-08-22 | M | Chile | OK |
| 49 | `133014861` | Cristian González | Consultor | Indefinido | 2022-11-21 | M | Chile | OK |
| 50 | `166609208` | Rodrigo González | Consultor | Indefinido | 2023-08-01 | M | Chile | OK |
| 51 | `261668815` | Laura Guerrero | Consultor | Plazo Fijo | 2026-05-04 | F | Venez | OK |
| 52 | `125707262` | Pedro Hidalgo | Consultor | Plazo Fijo | 2026-05-04 | M | Chile | OK |
| 53 | `188247415` | Liset Hurtado | Consultor | Indefinido | 2025-10-27 | F | Chile | OK |
| 54 | `199946021` | José Ibarra | Consultor | Plazo Fijo | 2026-05-04 | M | Chile | OK |
| 55 | `209102471` | Gabriel Jara | Consultor | Indefinido | 2025-12-01 | M | Chile | OK |
| 56 | `7521183K` | José Jara | Consultor | Indefinido | 2019-01-21 | M | Chile | OK |
| 57 | `203486731` | Patricio Jiménez | Consultor | Indefinido | 2025-10-06 | M | Chile | OK |
| 58 | `211383003` | Javier Jorge | Consultor | Indefinido | 2025-06-23 | M | Boliv | OK |
| 59 | `12440035K` | Francisco Karachón | Consultor | Indefinido | 2024-07-22 | M | Chile | OK |
| 60 | `7.449.697-0` | Eric Larenas | Consultor | Indefinido | 2025-01-20 | M | Chile | OK |
| 61 | `195390916` | María Lazo | Consultor | Plazo Fijo | 2026-05-04 | F | Chile | OK |
| 62 | `128952721` | Daniel Ledesma | Consultor | Indefinido | 2025-01-06 | M | Chile | OK |
| 63 | `141088769` | Erwin León | Consultor | Indefinido | 2019-11-04 | M | Chile | OK |
| 64 | `141684027` | María Leyton | Consultor | Plazo Fijo | 2026-04-21 | F | Chile | OK |
| 65 | `261241986` | José Lira | Consultor | Indefinido | 2019-01-28 | M | Venez | OK |
| 66 | `183175610` | Sebastián López | Consultor | Indefinido | 2016-03-02 | M | Chile | OK |
| 67 | `165658000` | Juan Loyola | Consultor | Plazo Fijo | 2026-01-05 | M | Chile | OK |
| 68 | `212894494` | Guery Lucas | Consultor | Indefinido | 2026-01-05 | M | Chile | OK |
| 69 | `163013983` | Ian Mac Lean | Consultor | Plazo Fijo | 2026-04-27 | M | Chile | OK |
| 70 | `159800334` | Juan Mamani | Consultor | Indefinido | 2020-02-24 | M | Chile | OK |
| 71 | `195422168` | Benjamín Marambio | Consultor | Indefinido | 2023-06-05 | M | Chile | OK |
| 72 | `103241553` | Marcelo Marambio | Consultor Principal | Indefinido | 2014-05-02 | M | Chile | OK |
| 73 | `262352803` | Dimas Medina | Consultor | Indefinido | 2025-12-09 | M | Venez | OK |
| 74 | `269793848` | Mairin Mijares | Consultor | Indefinido | 2022-10-03 | F | Venez | OK |
| 75 | `195381984` | Erick Miranda | Consultor | Indefinido | 2022-08-29 | M | Chile | OK |
| 76 | `108592532` | Daniel Mora | Consultor | Indefinido | 2022-11-07 | M | Chile | OK |
| 77 | `173603673` | Vanessa Mora | Consultor | Indefinido | 2024-11-24 | F | Chile | OK |
| 78 | `125753736` | Yerko Navarro | Consultor | Indefinido | 2018-01-08 | M | Chile | OK |
| 79 | `122099156` | Raúl Olcay | Consultor | Indefinido | 2020-03-09 | M | Chile | OK |
| 80 | `119273552` | Alejandro Opitz | Consultor Principal | Indefinido | 2014-12-01 | M | Chile | OK |
| 81 | `202956661` | Catalina Opitz | Asistente Ejecutiva | Indefinido | 2023-03-01 | F | Chile | OK |
| 82 | `131725469` | Lázaro Panire | Consultor | Indefinido | 2022-08-22 | M | Chile | OK |
| 83 | `136323091` | Rodrigo Pérez | Consultor | Indefinido | 2022-10-17 | M | Chile | OK |
| 84 | `147338147` | Oscar Quezada | Consultor Principal | Indefinido | 2014-05-02 | M | Perua | OK |
| 85 | `95201792` | Juan Rejas | Consultor | Indefinido | 2025-02-10 | M | Chile | OK |
| 86 | `146225292` | Sheryl Ríos | Consultor | Indefinido | 2022-11-02 | F | Chile | OK |
| 87 | `164366014` | Miguel Rivas | Consultor | Indefinido | 2024-02-19 | M | Chile | OK |
| 88 | `106699658` | Jorge Rivera | Consultor | Indefinido | 2025-09-22 | M | Chile | OK |
| 89 | `207350389` | Alejandra Rocco | Consultor | Indefinido | 2025-12-01 | F | Chile | OK |
| 90 | `183624008` | Annette Roco | Consultor | Indefinido | 2022-08-16 | F | Chile | OK |
| 91 | `16653657K` | Javier Rodríguez | Consultor | Indefinido | 2025-05-05 | M | Chile | OK |
| 92 | `118153022` | Cristian Rojas | Consultor | Indefinido | 2022-09-05 | M | Chile | OK |
| 93 | `185831833` | Felipe Rojas | Consultor | Indefinido | 2025-10-06 | M | Chile | OK |
| 94 | `174356904` | Génesis Rowe | Consultor | Indefinido | 2025-11-24 | F | Chile | OK |
| 95 | `106376085` | José Ruiz | Consultor Senior | Indefinido | 2025-04-14 | M | Chile | OK |
| 96 | `203487061` | Manuel Salvatierra | Consultor | Indefinido | 2025-10-20 | M | Chile | OK |
| 97 | `268961607` | Francisco Sánchez | Consultor | Indefinido | 2025-11-24 | M | Venez | OK |
| 98 | `86538091` | Bruno Schiappacasse | Consultor Senior | Indefinido | 2021-01-04 | M | Chile | OK |
| 99 | `133571604` | Carol Silva | Consultor | Indefinido | 2022-09-12 | F | Chile | OK |
| 100 | `119815134` | Juan Silva | Consultor | Indefinido | 2021-01-04 | M | Chile | OK |
| 101 | `270137474` | Miguel Socorro | Consultor | Indefinido | 2024-07-29 | M | Venez | OK |
| 102 | `134180072` | Eduardo Sotomayor | Consultor | Indefinido | 2023-12-11 | M | Chile | OK |
| 103 | `84312002` | Jorge Torres | Gerente Comercial | Indefinido | 2024-11-04 | M | Chile | OK |
| 104 | `153985472` | Nelson Torres | Consultor | Indefinido | 2025-11-17 | M | Chile | OK |
| 105 | `151116957` | José Urra | Asistente Gestión Integral | Indefinido | 2025-07-23 | M | Chile | OK |
| 106 | `170926870` | Monserrat Valencia | Consultor | Indefinido | 2021-09-13 | F | Chile | OK |
| 107 | `139961595` | Aldo Valenzuela | Consultor | Indefinido | 2023-01-03 | M | Chile | OK |
| 108 | `208642626` | Pedro Valenzuela | Consultor | Honorarios | 2026-02-20 | M | Chile | OK |
| 109 | `144379306` | Claudia Valle | Consultor | Indefinido | 2025-10-01 | F | Chile | OK |
| 110 | `82674470` | Eduardo Varas | Consultor | Indefinido | 2021-09-27 | M | Chile | OK |
| 111 | `194632703` | Jorge Vargas | Consultor | Indefinido | 2025-10-27 | M | Chile | OK |
| 112 | `116134306` | Carlos Vásquez | Consultor | Indefinido | 2025-10-01 | M | Chile | OK |
| 113 | `156846473` | Enrique Veliz | Consultor | Indefinido | 2022-08-16 | M | Chile | OK |
| 114 | `260424653` | Vicmayra Vergara | Consultor | Indefinido | 2022-11-21 | F | Venez | OK |
| 115 | `184849607` | Pedro Villalobos | Consultor | Indefinido | 2025-01-20 | M | Chile | OK |
| 116 | `136323156` | Fanny Villarroel | Consultor | Indefinido | 2021-05-11 | F | Chile | OK |
| 117 | `12569540K` | Juan Zepeda | Consultor | Indefinido | 2023-08-01 | M | Chile | OK |
| 118 | `168783795` | Juan Zuñiga | Consultor | Indefinido | 2025-04-21 | M | Chile | OK |

---
_Ver `limpiar_bd.sql` y `estandarizar_ruts_bd.sql` para corregir los problemas detectados._

