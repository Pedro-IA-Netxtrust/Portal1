# Reporte de Diferencias - CSV vs Base de Datos
_Generado: 

---

## Resumen de Reconciliacion

| Estado | Cantidad | Accion SQL |
|---|---|---|
| Sin cambios (match exacto) | 0 | Ninguna |
| Nuevos (solo en CSV) | 15 | importar_paso1_nuevos.sql |
| Para actualizar | 98 | importar_paso2_actualizar.sql |
| Otro contrato (solo en BD) | 20 | importar_paso3_revision.sql |
| **Total CSV** | **113** | |
| **Total BD** | **118** | |

---

## Trabajadores Nuevos (15)

> [!NOTE]
> En CSV pero no en BD. Se insertaran con importar_paso1_nuevos.sql.

| # | RUT | Nombre | Cargo | Centro Costo | Ingreso |
|---|---|---|---|---|---|
| 1 | 18.182.984-1 | Anderson Berna | Consultor | Serv.Apoyo PIMtto.Codelco DCH | 2025-11-03 |
| 2 | 12.976.306-K | Roger Brice�o | Consultor | Serv.Est.M&C.Rep.Red.Contra.Incendio DCH NCC30 | 2025-09-22 |
| 3 | 19.093.513-6 | Alex Calcina | Consultor | Serv.Apoyo PIMtto.Codelco DCH | 2025-10-27 |
| 4 | 15.013.426-9 | Juan Castillo | Consultor | Serv.Est.M&C. SAPCI SALAS ELEC DMH NCC30 | 2023-12-11 |
| 5 | 19.206.404-K | Valentina Contreras | Consultor | Serv.Apoyo PIMtto.Codelco DCH | 2025-11-03 |
| 6 | 19.204.703-K | Constanza Echeverr�a | Consultor | Serv.Apoyo PIMtto.Codelco DCH | 2025-10-06 |
| 7 | 12.575.237-3 | Alejandro Escalera | Consultor | Administrativo | 2025-07-15 |
| 8 | 12.517.017-K | Danilo Gonz�lez | Consultor | Serv.Est.M&C. Upgrade Concent.DMH NCC30 | 2025-12-01 |
| 9 | 13.789.195-6 | Robinson Mu�oz | Consultor | Serv.Est.M&C. Upgrade Concent.DMH NCC30 | 2024-01-08 |
| 10 | 17.735.104-0 | Ignacio Mu�oz | Consultor | Serv.Apoyo PIMtto.Codelco DCH | 2025-11-10 |
| 11 | 12.911.580-7 | Cristian Sep�lveda | Consultor | Serv.Est.M&C.Rep.Colapso.Domo DCH NCC30 | 2023-12-11 |
| 12 | 20.093.850-K | Jhon Smith | Consultor | Serv.Apoyo PIMtto.Codelco DCH | 2025-10-06 |
| 13 | 19.205.745-0 | Yandari Trigo | Consultor | Serv.Apoyo PIMtto.Codelco DCH | 2025-12-02 |
| 14 | 19.462.270-3 | Jorge Vargas | Consultor | Serv.Apoyo PIMtto.Codelco DCH | 2025-10-27 |
| 15 | 19.507.160-8 | Jorge Vivanco | Consultor | Serv.Apoyo PIMtto.Codelco DCH | 2025-10-20 |

---

## Para Actualizar (98)

> [!IMPORTANT]
> Revisar cada cambio antes de ejecutar importar_paso2_actualizar.sql.

### 1. Javier Altamirano - 17.831.329-0

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| nombre_2 | Andrés | **Andr�s** |
| calzado_seguridad | 42 | **** |
| talla_chaqueta | L | **** |
| talla_polera | L | **** |
| chaleco_geologo | L | **** |
| respirador | L | **** |

### 2. Katherina Alvarado - 17.094.193-4

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| calzado_seguridad | 38 | **** |
| talla_chaqueta | M | **** |
| talla_polera | M | **** |
| chaleco_geologo | S | **** |
| respirador | M | **** |

### 3. Guillermo Alvarado - 13.743.409-1

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| calzado_seguridad | 41 | **** |
| talla_chaqueta | M | **** |
| talla_polera | M | **** |
| chaleco_geologo | M | **** |
| respirador | L | **** |

### 4. Carlos Alvear - 8.609.678-1

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| area_departamento | Serv.Est.M&C.Eq.Maniobras DCH NCC30 | **Serv.Est.M&C.Rep.Colapso.Domo DCH NCC30** |
| calzado_seguridad | null | **** |
| talla_chaqueta | null | **** |
| talla_polera | null | **** |
| chaleco_geologo | null | **** |
| respirador | null | **** |

### 5. Alfonso Anza - 14.556.702-5

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| calzado_seguridad | 39 | **** |
| talla_chaqueta | M | **** |
| talla_polera | M | **** |
| chaleco_geologo | M | **** |
| respirador | M | **** |

### 6. Eduardo Arratia - 7.933.710-2

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| nombre_2 | Hernán | **Hern�n** |
| calzado_seguridad | null | **** |
| talla_chaqueta | null | **** |
| talla_polera | null | **** |
| chaleco_geologo | null | **** |
| respirador | null | **** |

### 7. Claudia Augusto - 21.910.425-1

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| calzado_seguridad | null | **** |
| talla_chaqueta | null | **** |
| talla_polera | null | **** |
| chaleco_geologo | null | **** |
| respirador | null | **** |

### 8. Claudio Avenda�o - 13.821.895-3

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| apellido_paterno | Avendaño | **Avenda�o** |
| calzado_seguridad | 42 | **** |
| talla_chaqueta | M | **** |
| talla_polera | M | **** |
| chaleco_geologo | M | **** |
| respirador | M | **** |

### 9. Daniel Az�a - 16.155.823-0

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| apellido_paterno | Azúa | **Az�a** |
| apellido_materno | Fernández | **Fern�ndez** |
| fecha_ingreso | 2022-08-22 | **2022-08-29** |
| calzado_seguridad | null | **** |
| talla_chaqueta | null | **** |
| talla_polera | null | **** |
| chaleco_geologo | null | **** |
| respirador | null | **** |

### 10. Boris Badilla - 16.100.706-4

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| calzado_seguridad | null | **** |
| talla_chaqueta | null | **** |
| talla_polera | null | **** |
| chaleco_geologo | null | **** |
| respirador | null | **** |

### 11. Enrique Baeza - 15.813.037-8

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| calzado_seguridad | 41 | **** |
| talla_chaqueta | XL | **** |
| talla_polera | XL | **** |
| chaleco_geologo | XL | **** |
| respirador | L | **** |

### 12. Sof�a Barbera - 9.631.711-5

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| nombre_1 | Sofía | **Sof�a** |
| area_departamento | Serv.Est.M&C. Etapa Ejecución DGM NCC30 | **Serv.Est.M&C. Upgrade Concent.DMH NCC30** |
| calzado_seguridad | null | **** |
| talla_chaqueta | null | **** |
| talla_polera | null | **** |
| chaleco_geologo | null | **** |
| respirador | null | **** |

### 13. Cristian Bascur - 19.812.753-1

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| apellido_materno | Gómez | **G�mez** |
| calzado_seguridad | 42 | **** |
| talla_chaqueta | M | **** |
| talla_polera | L | **** |
| chaleco_geologo | L | **** |
| respirador | L | **** |

### 14. Felipe Blanca - 19.788.063-5

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| calzado_seguridad | 41 | **** |
| talla_chaqueta | M | **** |
| talla_polera | M | **** |
| chaleco_geologo | M | **** |
| respirador | S | **** |

### 15. Ana Blanco - 26.186.436-3

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| nombre_2 | María | **Mar�a** |
| area_departamento | Serv.Est.M&C. Etapa Ejecución DGM NCC30 | **Serv.Est.M&C. PRECLA DMH NCC30** |
| calzado_seguridad | null | **** |
| talla_chaqueta | null | **** |
| talla_polera | null | **** |
| chaleco_geologo | null | **** |
| respirador | null | **** |

### 16. Fernando Bolados - 18.362.669-8

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| nombre_2 | Andrés | **Andr�s** |
| area_departamento | Serv.Apoyo Planificación SOMA DMH | **Serv.Apoyo PIMtto.Codelco DCH** |
| calzado_seguridad | 41 | **** |
| talla_chaqueta | L | **** |
| talla_polera | L | **** |
| chaleco_geologo | L | **** |
| respirador | L | **** |

### 17. B�rbara Borja - 14.496.217-6

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| nombre_1 | Bárbara | **B�rbara** |
| calzado_seguridad | null | **** |
| talla_chaqueta | null | **** |
| talla_polera | null | **** |
| chaleco_geologo | null | **** |
| respirador | null | **** |

### 18. Hugo Brice�o - 15.752.499-2

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| apellido_paterno | Briceño | **Brice�o** |
| apellido_materno | López | **L�pez** |
| nombre_2 | Aníbal | **An�bal** |
| fecha_ingreso | 2021-09-06 | **2022-05-17** |
| calzado_seguridad | 42 | **** |
| talla_chaqueta | M | **** |
| talla_polera | M | **** |
| chaleco_geologo | M | **** |
| respirador | L | **** |

### 19. Valentina B�rquez - 15.878.005-4

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| apellido_paterno | Bórquez | **B�rquez** |
| apellido_materno | Román | **Rom�n** |
| calzado_seguridad | 38 | **** |
| talla_chaqueta | L | **** |
| talla_polera | L | **** |
| chaleco_geologo | M | **** |
| respirador | M | **** |

### 20. Claudia Bugue�o - 18.362.293-5

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| apellido_paterno | Bugueño | **Bugue�o** |
| apellido_materno | Villalón | **Villal�n** |
| calzado_seguridad | null | **** |
| talla_chaqueta | null | **** |
| talla_polera | null | **** |
| chaleco_geologo | null | **** |
| respirador | null | **** |

### 21. Cristi�n Calder�n - 16.055.419-3

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| apellido_paterno | Calderón | **Calder�n** |
| nombre_1 | Cristián | **Cristi�n** |
| calzado_seguridad | 42 | **** |
| talla_chaqueta | M | **** |
| talla_polera | M | **** |
| chaleco_geologo | M | **** |
| respirador | M | **** |

### 22. Alejandra Campos - 15.969.541-7

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| calzado_seguridad | null | **** |
| talla_chaqueta | null | **** |
| talla_polera | null | **** |
| chaleco_geologo | null | **** |
| respirador | null | **** |

### 23. Lucinda Castillo - 11.932.893-4

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| calzado_seguridad | 36 | **** |
| talla_chaqueta | XXL | **** |
| talla_polera | XL | **** |
| chaleco_geologo | XL | **** |
| respirador | M | **** |

### 24. Jos� Chambi - 14.696.522-9

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| nombre_1 | José | **Jos�** |
| calzado_seguridad | 39 | **** |
| talla_chaqueta | M | **** |
| talla_polera | M | **** |
| chaleco_geologo | M | **** |
| respirador | M | **** |

### 25. Alex Chocobar - 9.310.772-1

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| nombre_2 | Iván | **Iv�n** |
| area_departamento | Serv.Est.M&C.Alim.Vibratorios DCH NCC30 | **Serv.Est.M&C.Rep.Colapso.Domo DCH NCC30** |
| fecha_ingreso | 2021-06-23 | **2021-08-23** |
| calzado_seguridad | null | **** |
| talla_chaqueta | null | **** |
| talla_polera | null | **** |
| chaleco_geologo | null | **** |
| respirador | null | **** |

### 26. Alexander Collants - 20.734.131-2

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| calzado_seguridad | 42 | **** |
| talla_chaqueta | XXL | **** |
| talla_polera | XXL | **** |
| chaleco_geologo | XXL | **** |
| respirador | L | **** |

### 27. Jos� Contreras - 16.258.764-1

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| nombre_1 | José | **Jos�** |
| calzado_seguridad | 42 | **** |
| talla_chaqueta | L | **** |
| talla_polera | L | **** |
| chaleco_geologo | L | **** |
| respirador | L | **** |

### 28. Karen Cort�s - 20.093.205-6

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| apellido_paterno | Cortés | **Cort�s** |
| calzado_seguridad | 36 | **** |
| talla_chaqueta | S | **** |
| talla_polera | S | **** |
| chaleco_geologo | S | **** |
| respirador | S | **** |

### 29. Rodrigo Cuevas - 19.928.533-5

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| calzado_seguridad | 44 | **** |
| talla_chaqueta | L | **** |
| talla_polera | L | **** |
| chaleco_geologo | L | **** |
| respirador | L | **** |

### 30. Cristian D�az - 16.868.211-5

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| apellido_paterno | Díaz | **D�az** |
| nombre_2 | Andrés | **Andr�s** |
| calzado_seguridad | 40 | **** |
| talla_chaqueta | M | **** |
| talla_polera | M | **** |
| chaleco_geologo | M | **** |
| respirador | L | **** |

### 31. Mario D�az - 25.936.133-8

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| apellido_paterno | Díaz | **D�az** |
| nombre_2 | José | **Jos�** |
| area_departamento | Administrativo | **Serv.Est.M&C.Rep.Red.Contra.Incendio DCH NCC30** |
| calzado_seguridad | null | **** |
| talla_chaqueta | null | **** |
| talla_polera | null | **** |
| chaleco_geologo | null | **** |
| respirador | null | **** |

### 32. Rodrigo De la Cruz - 13.692.436-2

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| nombre_2 | Andrés | **Andr�s** |
| calzado_seguridad | null | **** |
| talla_chaqueta | null | **** |
| talla_polera | null | **** |
| chaleco_geologo | null | **** |
| respirador | null | **** |

### 33. Fidel Delpino - 25.958.444-2

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| calzado_seguridad | null | **** |
| talla_chaqueta | null | **** |
| talla_polera | null | **** |
| chaleco_geologo | null | **** |
| respirador | null | **** |

### 34. Karina Echeverr�a - 18.233.881-8

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| apellido_paterno | Echeverría | **Echeverr�a** |
| calzado_seguridad | 38 | **** |
| talla_chaqueta | L | **** |
| talla_polera | L | **** |
| chaleco_geologo | L | **** |
| respirador | M | **** |

### 35. Mar�a Fern�ndez - 18.826.513-8

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| apellido_paterno | Fernández | **Fern�ndez** |
| apellido_materno | Calderón | **Calder�n** |
| nombre_1 | María | **Mar�a** |
| calzado_seguridad | 36 | **** |
| talla_chaqueta | M | **** |
| talla_polera | M | **** |
| chaleco_geologo | S | **** |
| respirador | M | **** |

### 36. Ricardo Flores - 18.400.230-2

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| calzado_seguridad | 41 | **** |
| talla_chaqueta | S | **** |
| talla_polera | S | **** |
| chaleco_geologo | S | **** |
| respirador | M | **** |

### 37. Marco Flores - 18.149.268-6

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| calzado_seguridad | 41 | **** |
| talla_chaqueta | M | **** |
| talla_polera | M | **** |
| chaleco_geologo | M | **** |
| respirador | M | **** |

### 38. Francisco Godoy - 10.835.947-1

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| nombre_2 | Aníbal | **An�bal** |
| area_departamento | Serv.Est.M&C.Eq.Maniobras DCH NCC30 | **Serv.Est.M&C. PRECLA DMH NCC30** |
| calzado_seguridad | 42 | **** |
| talla_chaqueta | M | **** |
| talla_polera | M | **** |
| chaleco_geologo | M | **** |
| respirador | M | **** |

### 39. Rodrigo Gonz�lez - 16.660.920-8

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| apellido_paterno | González | **Gonz�lez** |
| calzado_seguridad | 45 | **** |
| talla_chaqueta | L | **** |
| talla_polera | L | **** |
| chaleco_geologo | L | **** |
| respirador | L | **** |

### 40. Cristian Gonz�lez - 13.007.836-2

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| apellido_paterno | González | **Gonz�lez** |
| calzado_seguridad | 43 | **** |
| talla_chaqueta | XXL | **** |
| talla_polera | XXL | **** |
| chaleco_geologo | XL | **** |
| respirador | S | **** |

### 41. Cristian Gonz�lez - 13.301.486-1

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| apellido_paterno | González | **Gonz�lez** |
| apellido_materno | López | **L�pez** |
| area_departamento | Administrativo | **Serv.Est.M&C.Rep.Red.Contra.Incendio DCH NCC30** |
| calzado_seguridad | null | **** |
| talla_chaqueta | null | **** |
| talla_polera | null | **** |
| chaleco_geologo | null | **** |
| respirador | null | **** |

### 42. Liset Hurtado - 18.824.741-5

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| calzado_seguridad | 38 | **** |
| talla_chaqueta | XL | **** |
| talla_polera | XL | **** |
| chaleco_geologo | XL | **** |
| respirador | L | **** |

### 43. Jos� Jara - 7.521.183-K

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| nombre_1 | José | **Jos�** |
| area_departamento | Serv.Est.M&C.Alim.Vibratorios DCH NCC30 | **Serv.Est.M&C.Sist.Enfriamiento DCH NCC30** |
| calzado_seguridad | null | **** |
| talla_chaqueta | null | **** |
| talla_polera | null | **** |
| chaleco_geologo | null | **** |
| respirador | null | **** |

### 44. Gabriel Jara - 20.910.247-1

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| area_departamento | Administrativo | **Serv.Est.M&C.Rep.Red.Contra.Incendio DCH NCC30** |
| calzado_seguridad | null | **** |
| talla_chaqueta | null | **** |
| talla_polera | null | **** |
| chaleco_geologo | null | **** |
| respirador | null | **** |

### 45. Patricio Jim�nez - 20.348.673-1

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| apellido_paterno | Jiménez | **Jim�nez** |
| calzado_seguridad | 41 | **** |
| talla_chaqueta | S | **** |
| talla_polera | S | **** |
| chaleco_geologo | S | **** |
| respirador | L | **** |

### 46. Javier Jorge - 21.138.300-3

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| nombre_2 | null | **** |
| calzado_seguridad | 39 | **** |
| talla_chaqueta | S | **** |
| talla_polera | S | **** |
| chaleco_geologo | S | **** |
| respirador | M | **** |

### 47. Francisco Karach�n - 12.440.035-K

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| apellido_paterno | Karachón | **Karach�n** |
| nombre_2 | null | **** |
| calzado_seguridad | null | **** |
| talla_chaqueta | null | **** |
| talla_polera | null | **** |
| chaleco_geologo | null | **** |
| respirador | null | **** |

### 48. Eric Larenas - 7.449.697-0

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| apellido_materno | García | **Garc�a** |
| area_departamento | Serv.Est.M&C.Eq.Maniobras DCH NCC30 | **Serv.Est.M&C. Upgrade Concent.DMH NCC30** |
| calzado_seguridad | null | **** |
| talla_chaqueta | null | **** |
| talla_polera | null | **** |
| chaleco_geologo | null | **** |
| respirador | null | **** |

### 49. Daniel Ledesma - 12.895.272-1

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| area_departamento | Serv.Est.M&C. Etapa Ejecución DGM NCC30 | **Serv.Est.M&C. PRECLA DMH NCC30** |
| calzado_seguridad | 42 | **** |
| talla_chaqueta | M | **** |
| talla_polera | M | **** |
| chaleco_geologo | M | **** |
| respirador | M | **** |

### 50. Erwin Le�n - 14.108.876-9

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| apellido_paterno | León | **Le�n** |
| calzado_seguridad | 42 | **** |
| talla_chaqueta | XL | **** |
| talla_polera | XL | **** |
| chaleco_geologo | XL | **** |
| respirador | XL | **** |

### 51. Jos� Lira - 26.124.198-6

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| apellido_materno | Rodríguez | **Rodr�guez** |
| nombre_1 | José | **Jos�** |
| area_departamento | Serv.Est.M&C. Etapa Ejecución DGM NCC30 | **Serv.Est.M&C.Pre-cla Batet�a Hidro DMH NCC30** |
| calzado_seguridad | null | **** |
| talla_chaqueta | null | **** |
| talla_polera | null | **** |
| chaleco_geologo | null | **** |
| respirador | null | **** |

### 52. Juan Mamani - 15.980.033-4

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| calzado_seguridad | 40 | **** |
| talla_chaqueta | M | **** |
| talla_polera | M | **** |
| chaleco_geologo | M | **** |
| respirador | M | **** |

### 53. Marcelo Marambio - 10.324.155-3

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| apellido_materno | Díaz | **D�az** |
| calzado_seguridad | 43 | **** |
| talla_chaqueta | L | **** |
| talla_polera | M | **** |
| chaleco_geologo | L | **** |
| respirador | M | **** |

### 54. Benjam�n Marambio - 19.542.216-8

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| nombre_1 | Benjamín | **Benjam�n** |
| calzado_seguridad | 41 | **** |
| talla_chaqueta | L | **** |
| talla_polera | L | **** |
| chaleco_geologo | M | **** |
| respirador | L | **** |

### 55. Dimas Medina - 26.235.280-3

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| apellido_materno | Jiménez | **Jim�nez** |
| calzado_seguridad | 42 | **** |
| talla_chaqueta | L | **** |
| talla_polera | L | **** |
| chaleco_geologo | L | **** |
| respirador | L | **** |

### 56. Mairin Mijares - 26.979.384-8

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| calzado_seguridad | 39 | **** |
| talla_chaqueta | L | **** |
| talla_polera | L | **** |
| chaleco_geologo | M | **** |
| respirador | S | **** |

### 57. Erick Miranda - 19.538.198-4

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| calzado_seguridad | 43 | **** |
| talla_chaqueta | M | **** |
| talla_polera | M | **** |
| chaleco_geologo | M | **** |
| respirador | L | **** |

### 58. Vanessa Mora - 17.360.367-3

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| fecha_ingreso | 2024-11-24 | **2025-11-24** |
| calzado_seguridad | 40 | **** |
| talla_chaqueta | L | **** |
| talla_polera | L | **** |
| chaleco_geologo | L | **** |
| respirador | M | **** |

### 59. Daniel Mora - 10.859.253-2

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| calzado_seguridad | 42 | **** |
| talla_chaqueta | M | **** |
| talla_polera | M | **** |
| chaleco_geologo | M | **** |
| respirador | M | **** |

### 60. Yerko Navarro - 12.575.373-6

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| nombre_2 | Román | **Roman** |
| calzado_seguridad | 43 | **** |
| talla_chaqueta | XXL | **** |
| talla_polera | XXL | **** |
| chaleco_geologo | XXL | **** |
| respirador | L | **** |

### 61. Ra�l Olcay - 12.209.915-6

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| apellido_materno | Sepúlveda | **Sep�lveda** |
| nombre_1 | Raúl | **Ra�l** |
| calzado_seguridad | null | **** |
| talla_chaqueta | null | **** |
| talla_polera | null | **** |
| chaleco_geologo | null | **** |
| respirador | null | **** |

### 62. Alejandro Opitz - 11.927.355-2

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| calzado_seguridad | 44 | **** |
| talla_chaqueta | XL | **** |
| talla_polera | XL | **** |
| chaleco_geologo | XL | **** |
| respirador | L | **** |

### 63. Catalina Opitz - 20.295.666-1

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| apellido_materno | Sánchez | **S�nchez** |
| nombre_2 | null | **** |
| calzado_seguridad | null | **** |
| talla_chaqueta | null | **** |
| talla_polera | null | **** |
| chaleco_geologo | null | **** |
| respirador | null | **** |

### 64. L�zaro Panire - 13.172.546-9

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| nombre_1 | Lázaro | **L�zaro** |
| area_departamento | Serv.Apoyo Planificación SOMA DMH | **Serv.Est.M&C.Rep.Red.Contra.Incendio DCH NCC30** |
| calzado_seguridad | 42 | **** |
| talla_chaqueta | M | **** |
| talla_polera | M | **** |
| chaleco_geologo | M | **** |
| respirador | M | **** |

### 65. Rodrigo P�rez - 13.632.309-1

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| apellido_paterno | Pérez | **P�rez** |
| calzado_seguridad | 41 | **** |
| talla_chaqueta | L | **** |
| talla_polera | L | **** |
| chaleco_geologo | L | **** |
| respirador | M | **** |

### 66. Oscar Quezada - 14.733.814-7

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| calzado_seguridad | null | **** |
| talla_chaqueta | null | **** |
| talla_polera | null | **** |
| chaleco_geologo | null | **** |
| respirador | null | **** |

### 67. Juan Rejas - 9.520.179-2

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| area_departamento | Serv.Est.M&C. Etapa Ejecución DGM NCC30 | **Serv.Est.M&C.Pre-cla Batet�a Hidro DMH NCC30** |
| calzado_seguridad | null | **** |
| talla_chaqueta | null | **** |
| talla_polera | null | **** |
| chaleco_geologo | null | **** |
| respirador | null | **** |

### 68. Miguel Rivas - 16.436.601-4

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| apellido_materno | Martínez | **Mart�nez** |
| calzado_seguridad | 42 | **** |
| talla_chaqueta | L | **** |
| talla_polera | L | **** |
| chaleco_geologo | L | **** |
| respirador | L | **** |

### 69. Jorge Rivera - 10.669.965-8

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| area_departamento | Administrativo | **Serv.Est.M&C.Rep.Red.Contra.Incendio DCH NCC30** |
| calzado_seguridad | null | **** |
| talla_chaqueta | null | **** |
| talla_polera | null | **** |
| chaleco_geologo | null | **** |
| respirador | null | **** |

### 70. Alejandra Rocco - 20.735.038-9

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| calzado_seguridad | 36 | **** |
| talla_chaqueta | M | **** |
| talla_polera | M | **** |
| chaleco_geologo | L | **** |
| respirador | S | **** |

### 71. Annette Roco - 18.362.400-8

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| calzado_seguridad | 38 | **** |
| talla_chaqueta | M | **** |
| talla_polera | M | **** |
| chaleco_geologo | S | **** |
| respirador | M | **** |

### 72. Javier Rodr�guez - 16.653.657-K

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| apellido_paterno | Rodríguez | **Rodr�guez** |
| apellido_materno | Pérez | **P�rez** |
| area_departamento | Serv.Est.M&C. Etapa Ejecución DGM NCC30 | **Serv.Est.M&C. SAPCI SALAS ELEC DMH NCC30** |
| calzado_seguridad | null | **** |
| talla_chaqueta | null | **** |
| talla_polera | null | **** |
| chaleco_geologo | null | **** |
| respirador | null | **** |

### 73. Cristian Rojas - 11.815.302-2

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| calzado_seguridad | 43 | **** |
| talla_chaqueta | L | **** |
| talla_polera | L | **** |
| chaleco_geologo | L | **** |
| respirador | L | **** |

### 74. Felipe Rojas - 18.583.183-3

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| calzado_seguridad | 44 | **** |
| talla_chaqueta | XL | **** |
| talla_polera | XL | **** |
| chaleco_geologo | XL | **** |
| respirador | L | **** |

### 75. Sheryl R�os - 14.622.529-2

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| apellido_paterno | Ríos | **R�os** |
| area_departamento | Administrativo | **Serv.Est.M&C.Rep.Red.Contra.Incendio DCH NCC30** |
| calzado_seguridad | null | **** |
| talla_chaqueta | null | **** |
| talla_polera | null | **** |
| chaleco_geologo | null | **** |
| respirador | null | **** |

### 76. G�nesis Rowe - 17.435.690-4

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| nombre_1 | Génesis | **G�nesis** |
| calzado_seguridad | 36 | **** |
| talla_chaqueta | M | **** |
| talla_polera | M | **** |
| chaleco_geologo | S | **** |
| respirador | M | **** |

### 77. Jos� Ruiz - 10.637.608-5

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| nombre_1 | José | **Jos�** |
| calzado_seguridad | null | **** |
| talla_chaqueta | null | **** |
| talla_polera | null | **** |
| chaleco_geologo | null | **** |
| respirador | null | **** |

### 78. Manuel Salvatierra - 20.348.706-1

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| calzado_seguridad | 43 | **** |
| talla_chaqueta | XXL | **** |
| talla_polera | XXL | **** |
| chaleco_geologo | XXL | **** |
| respirador | L | **** |

### 79. Bruno Schiappacasse - 8.653.809-1

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| nombre_2 | null | **Alberto** |
| area_departamento | Serv.Est.M&C. Etapa Ejecución DGM NCC30 | **Serv.Est.M&C. SAPCI SALAS ELEC DMH NCC30** |
| calzado_seguridad | null | **** |
| talla_chaqueta | null | **** |
| talla_polera | null | **** |
| chaleco_geologo | null | **** |
| respirador | null | **** |

### 80. Carol Silva - 13.357.160-4

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| apellido_materno | Bugueño | **Bugue�o** |
| calzado_seguridad | 37 | **** |
| talla_chaqueta | M | **** |
| talla_polera | M | **** |
| chaleco_geologo | S | **** |
| respirador | S | **** |

### 81. Juan Silva - 11.981.513-4

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| nombre_2 | Andrés | **Andr�s** |
| area_departamento | Serv.Est.M&C.Eq.Maniobras DCH NCC30 | **Serv.Est.M&C.Sist.Enfriamiento DCH NCC30** |
| calzado_seguridad | null | **** |
| talla_chaqueta | null | **** |
| talla_polera | null | **** |
| chaleco_geologo | null | **** |
| respirador | null | **** |

### 82. Francisco S�nchez - 26.896.160-7

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| apellido_paterno | Sánchez | **S�nchez** |
| nombre_2 | Darío | **Dar�o** |
| calzado_seguridad | 42 | **** |
| talla_chaqueta | M | **** |
| talla_polera | M | **** |
| chaleco_geologo | M | **** |
| respirador | M | **** |

### 83. Miguel Socorro - 27.013.747-4

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| apellido_materno | null | **** |
| area_departamento | Serv.Est.M&C.Alim.Vibratorios DCH NCC30 | **Serv.Est.M&C. PRECLA DMH NCC30** |
| calzado_seguridad | null | **** |
| talla_chaqueta | null | **** |
| talla_polera | null | **** |
| chaleco_geologo | null | **** |
| respirador | null | **** |

### 84. Eduardo Sotomayor - 13.418.007-2

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| apellido_materno | Álvarez | **�lvarez** |
| area_departamento | Administrativo | **Serv.Est.M&C.Sist.Enfriamiento DCH NCC30** |
| calzado_seguridad | null | **** |
| talla_chaqueta | null | **** |
| talla_polera | null | **** |
| chaleco_geologo | null | **** |
| respirador | null | **** |

### 85. Nelson Torres - 15.398.547-2

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| apellido_materno | Ríos | **R�os** |
| nombre_2 | Andrés | **Andr�s** |
| area_departamento | Serv.Est.M&C. Etapa Ejecución DGM NCC30 | **Serv.Est.M&C.Pre-cla Batet�a Hidro DMH NCC30** |
| calzado_seguridad | null | **** |
| talla_chaqueta | null | **** |
| talla_polera | null | **** |
| chaleco_geologo | null | **** |
| respirador | null | **** |

### 86. Jorge Torres - 8.431.200-2

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| calzado_seguridad | null | **** |
| talla_chaqueta | null | **** |
| talla_polera | null | **** |
| chaleco_geologo | null | **** |
| respirador | null | **** |

### 87. Jos� Urra - 15.111.695-7

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| nombre_1 | José | **Jos�** |
| cargo | Asistente Gestión Integral | **Asistente Gesti�n Integral** |
| calzado_seguridad | 41 | **** |
| talla_chaqueta | L | **** |
| talla_polera | L | **** |
| chaleco_geologo | L | **** |
| respirador | L | **** |

### 88. Monserrat Valencia - 17.092.687-0

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| calzado_seguridad | 37 | **** |
| talla_chaqueta | S | **** |
| talla_polera | S | **** |
| chaleco_geologo | S | **** |
| respirador | S | **** |

### 89. Aldo Valenzuela - 13.996.159-5

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| nombre_2 | Patricio | **** |
| calzado_seguridad | 43 | **** |
| talla_chaqueta | L | **** |
| talla_polera | L | **** |
| chaleco_geologo | L | **** |
| respirador | M | **** |

### 90. Claudia Valle - 14.437.930-6

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| calzado_seguridad | null | **** |
| talla_chaqueta | null | **** |
| talla_polera | null | **** |
| chaleco_geologo | null | **** |
| respirador | null | **** |

### 91. Eduardo Varas - 8.267.447-0

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| nombre_2 | null | **** |
| area_departamento | Serv.Est.M&C.Alim.Vibratorios DCH NCC30 | **Serv.Est.M&C. SAPCI SALAS ELEC DMH NCC30** |
| calzado_seguridad | null | **** |
| talla_chaqueta | null | **** |
| talla_polera | null | **** |
| chaleco_geologo | null | **** |
| respirador | null | **** |

### 92. Enrique Veliz - 15.684.647-3

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| calzado_seguridad | 42 | **** |
| talla_chaqueta | M | **** |
| talla_polera | M | **** |
| chaleco_geologo | M | **** |
| respirador | L | **** |

### 93. Vicmayra Vergara - 26.042.465-3

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| calzado_seguridad | 36 | **** |
| talla_chaqueta | M | **** |
| talla_polera | M | **** |
| chaleco_geologo | S | **** |
| respirador | S | **** |

### 94. Pedro Villalobos - 18.484.960-7

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| nombre_2 | Héctor | **H�ctor** |
| calzado_seguridad | 43 | **** |
| talla_chaqueta | L | **** |
| talla_polera | L | **** |
| chaleco_geologo | L | **** |
| respirador | M | **** |

### 95. Fanny Villarroel - 13.632.315-6

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| calzado_seguridad | 36 | **** |
| talla_chaqueta | L | **** |
| talla_polera | L | **** |
| chaleco_geologo | L | **** |
| respirador | M | **** |

### 96. Carlos V�squez - 11.613.430-6

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| apellido_paterno | Vásquez | **V�squez** |
| calzado_seguridad | null | **** |
| talla_chaqueta | null | **** |
| talla_polera | null | **** |
| chaleco_geologo | null | **** |
| respirador | null | **** |

### 97. Juan Zepeda - 12.569.540-K

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| calzado_seguridad | 41 | **** |
| talla_chaqueta | L | **** |
| talla_polera | L | **** |
| chaleco_geologo | L | **** |
| respirador | M | **** |

### 98. Juan Zu�iga - 16.878.379-5

| Campo | Valor BD (actual) | Valor CSV (nuevo) |
|---|---|---|
| apellido_paterno | Zuñiga | **Zu�iga** |
| area_departamento | Administrativo | **Serv.Est.M&C.Rep.Red.Contra.Incendio DCH NCC30** |
| calzado_seguridad | null | **** |
| talla_chaqueta | null | **** |
| talla_polera | null | **** |
| chaleco_geologo | null | **** |
| respirador | null | **** |

---

## Otro Contrato - Solo en BD (20)

> [!NOTE]
> Pertenecen a otros contratos (Valentina/Administracion). No son errores.

| # | RUT | Nombre | Cargo | Ingreso |
|---|---|---|---|---|
| 1 | 20.460.250-6 | Josepedro Abbott | Administrativo | 2026-01-19 |
| 2 | 19.144.852-9 | Natalia Arias | Consultor | 2026-04-01 |
| 3 | 18.182.984-2 | Anderson Berna | Consultor | 2025-11-03 |
| 4 | 15.769.436-7 | Marjorie Callejas | null | 2026-01-06 |
| 5 | 17.815.841-4 | Cristian Cataldo | Consultor | 2026-03-02 |
| 6 | 14.112.061-1 | Cristian Cortés | Consultor | 2026-03-12 |
| 7 | 19.463.790-K | Javier Cortés | Consultor | 2026-03-16 |
| 8 | 18.352.592-1 | Alex Cortés | Consultor | 2026-03-02 |
| 9 | 19.867.356-0 | Diego Díaz | Consultor | 2026-04-01 |
| 10 | 26.166.881-5 | Laura Guerrero | Consultor | 2026-05-04 |
| 11 | 12.570.726-2 | Pedro Hidalgo | Consultor | 2026-05-04 |
| 12 | 19.994.602-1 | José Ibarra | Consultor | 2026-05-04 |
| 13 | 19.539.091-6 | María Lazo | Consultor | 2026-05-04 |
| 14 | 14.168.402-7 | María Leyton | Consultor | 2026-04-21 |
| 15 | 18.317.561-0 | Sebastián López | Consultor | 2016-03-02 |
| 16 | 16.565.800-0 | Juan Loyola | Consultor | 2026-01-05 |
| 17 | 21.289.449-4 | Guery Lucas | Consultor | 2026-01-05 |
| 18 | 16.301.398-3 | Ian Mac Lean | Consultor | 2026-04-27 |
| 19 | 20.864.262-6 | Pedro Valenzuela | Consultor | 2026-02-20 |
| 20 | 19.463.270-3 | Jorge Vargas | Consultor | 2025-10-27 |

---

## Sin Cambios - Match Exacto (0)

| # | RUT | Nombre |
|---|---|---|

---
_Proximo paso: ejecutar los SQL en Supabase en orden: paso1 -> paso2 -> paso3 -> paso4_

