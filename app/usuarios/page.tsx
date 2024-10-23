"use client";
import { DeleteIcon } from '@chakra-ui/icons'; // Importar el ícono de eliminación


import { useState, useEffect, useRef } from "react";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Box,
  Input,
  IconButton,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Flex,
  Spinner,
  Text,
  Stack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Select,
  useDisclosure,
} from "@chakra-ui/react";

interface Usuario {
  usuario: string;
  username: string;  
  usuario_id: number;
  nombre_apellido: string;
  mail: string;
  fecha_alta: string;
  ultimo_acceso?: string;
  rol: string;
  puesto: string;
  rol_id: number;
  puesto_id: number;
  legajo: string;
  telefono: string;
}

interface Rol {
  rol_id: number;
  rol: string;
}

interface Puesto {
  puesto_id: number;
  puesto: string;
}

export default function UsuariosPage() {
  const [loading, setLoading] = useState(false);
  const [criterio, setCriterio] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [puestos, setPuestos] = useState<Puesto[]>([]);
  const [errorMessages, setErrorMessages] = useState<{ [key: string]: string }>({});
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  

  const [nuevoUsuario, setNuevoUsuario] = useState({
    usuario: "",
    nombre_apellido: "",
    rol_id: 0,
    puesto_id: 0,
    mail: "",
    pwd: "",
    legajo: "",
    telefono: ""
  });

  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState({
    rol_id: 0,
    puesto_id: 0,
    usuario: '',
    usuario_id: 0,
    mail: '',
    nombre_apellido: '',
    puesto: '',
    pwd: '',
    legajo: '',
    telefono: ''
    
  });

  const abrirModalEdicion = (usuario: any) => {
    setUsuarioSeleccionado(usuario);
    setIsEditModalOpen(true);
  };


  const { isOpen, onOpen, onClose } = useDisclosure();

 


  // Función para listar usuarios (con paginación)
  const fetchUsuarios = async (page = 1) => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3002/usuarios/listar?page=${page}`
      );
      const data = await response.json();
      setUsuarios(data.usuarios);
      setTotalPages(data.totalPages);
      setCurrentPage(page); // Actualizar la página actual
    } catch (error) {
      console.error("Error al listar usuarios:", error);
    } finally {
      setLoading(false);
    }
  };

// Función para eliminar (lógicamente) un usuario
const EliminarUsuarioConConfirmacion = ({ usuario_id, fetchUsuarios }: { usuario_id: number, fetchUsuarios: () => void }) => {
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);  // Controla si el diálogo está abierto o cerrado
    const cancelRef = useRef<HTMLButtonElement>(null);
    
    const onClose = () => setIsConfirmOpen(false); // Cierra el diálogo

    const eliminarUsuario = async () => {
        try {
            const response = await fetch(`http://localhost:3002/usuarios/eliminar/${usuario_id}`, {
                method: 'GET', // Usar GET para la eliminación lógica
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status} ${response.statusText}`);
            }

            // Refrescar la lista de usuarios después de la eliminación lógica
            fetchUsuarios();
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
        } finally {
            onClose(); // Cerrar el diálogo después de completar la acción
        }
    };

    return (
      <>
        <IconButton
          icon={<DeleteIcon />}
          onClick={(e) => {
            e.stopPropagation();  // Detiene la propagación del evento para evitar que otros manejadores se activen
            setIsConfirmOpen(true);
          }}
          aria-label="Eliminar usuario"
        />
    
        <AlertDialog
          isOpen={isConfirmOpen}
          leastDestructiveRef={cancelRef}
          onClose={onClose}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Eliminar Usuario
              </AlertDialogHeader>
    
              <AlertDialogBody>
                ¿Estás seguro? No podrás revertir esta acción.
              </AlertDialogBody>
    
              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={onClose}>
                  Cancelar
                </Button>
                <Button colorScheme="red" onClick={eliminarUsuario} ml={3}>
                  Eliminar
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </>
    );
  }


  // Función para buscar usuarios por criterio
  const buscarUsuarios = async () => {
    if (!criterio.trim()) {
      fetchUsuarios(currentPage); // Mantener la página actual
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3002/usuarios/buscar/${criterio}`
      );
      const data = await response.json();
      setUsuarios(data.usuarios);
    } catch (error) {
      console.error("Error al buscar usuarios:", error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar usuarios por defecto cuando se carga la página
  useEffect(() => {
    fetchUsuarios();
    fetchRoles();
    fetchPuestos();
  }, []);

  // Obtener roles desde la API
  const fetchRoles = async () => {
    try {
      const response = await fetch("http://localhost:3002/usuarios/roles");
      const data = await response.json();
      setRoles(data);
    } catch (error) {
      console.error("Error al obtener roles:", error);
    }
  };

  // Obtener puestos desde la API
  const fetchPuestos = async () => {
    try {
      const response = await fetch("http://localhost:3002/usuarios/puestos");
      const data = await response.json();
      setPuestos(data);
    } catch (error) {
      console.error("Error al obtener puestos:", error);
    }
  };

  //Guarda los datos del usuario editado
  const guardarCambios = async (usuario: any) => {
    try {
      const response = await fetch(`http://localhost:3002/usuarios/modificar`, {
        method: 'PUT', // Usar el método PUT
        headers: {
          'Content-Type': 'application/json', // Especifica que el cuerpo de la solicitud es JSON
        },
        body: JSON.stringify(usuario), // Convertir el objeto `usuario` en una cadena JSON
        
      });
      console.log(usuario);
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
  
      // Si la respuesta es exitosa, recargar la lista de usuarios
      fetchUsuarios();
      setIsEditModalOpen(false); // Cerrar el modal
  
    } catch (error) {
      console.error('Error al actualizar el usuario:', error);
      // Manejar el error (por ejemplo, mostrando un mensaje al usuario)
    }
  };
  

  // Función para manejar el cambio en los campos del nuevo usuario
  const handleNuevoUsuarioChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNuevoUsuario({
      ...nuevoUsuario,
      [name]: name === "rol_id" || name === "puesto_id" ? parseInt(value) : value,
    });
    // Limpiar mensaje de error al modificar el campo
    setErrorMessages((prev) => ({ ...prev, [name]: "" }));
  };

  // Función para crear el nuevo usuario
  const crearUsuario = async () => {
    // Limpiar mensajes de error previos
    setErrorMessages({});

    const errors: { [key: string]: string } = {};
    // Validar campos
    if (!nuevoUsuario.usuario) errors.usuario = "El campo 'Usuario' es obligatorio.";
    if (!nuevoUsuario.nombre_apellido) errors.nombre_apellido = "El campo 'Nombre y Apellido' es obligatorio.";
    if (!nuevoUsuario.mail) errors.mail = "El campo 'Email' es obligatorio.";
    if (!nuevoUsuario.rol_id) errors.rol_id = "El campo 'Rol' es obligatorio.";
    if (!nuevoUsuario.puesto_id) errors.puesto_id = "El campo 'Puesto' es obligatorio.";
    if (!nuevoUsuario.pwd) errors.pwd = "El campo 'Contraseña' es obligatorio.";
    if (!nuevoUsuario.legajo) errors.pwd = "El campo 'Legajo' es obligatorio.";
    if (!nuevoUsuario.telefono) errors.pwd = "El campo 'Telefono' es obligatorio.";

    if (Object.keys(errors).length > 0) {
      setErrorMessages(errors);
      return;
    }

    try {
      const response = await fetch("http://localhost:3002/usuarios/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevoUsuario),
      });
      const data = await response.json();
      if (response.status === 201) {
        fetchUsuarios(currentPage); // Refrescar la lista de usuarios después de crear uno nuevo
        onClose(); // Cerrar el modal

        // Resetear formulario
        setNuevoUsuario({
          usuario: '',
          nombre_apellido: '',
          mail: '',
          rol_id: 0,
          puesto_id: 0,
          pwd: '',
          telefono: '',
          legajo: ''
        });
      } else {
        console.error("Error al crear usuario 201:", data.message);
      }
    } catch (error) {
      console.error("Error al crear usuario:", error);
    }
  };

  return (
    <Box p={5}>
      {/* Botón para abrir el modal */}
      <Button colorScheme="teal" onClick={() => { onOpen(); setErrorMessages({}); }} mb={5}>
        Agregar Usuario
      </Button>

      <Flex mb={5} alignItems="center" justifyContent="flex-end">
      <Input
        placeholder="Buscar usuarios por nombre"
        value={criterio}
        onChange={(e) => setCriterio(e.target.value)}
        mr={2}
        width="300px"  // Fija el ancho del input a 300px
      />
      <Button colorScheme="teal" onClick={buscarUsuarios}>
        Buscar
      </Button>
    </Flex>


      {loading ? (
        <Flex justifyContent="center">
          <Spinner size="xl" />
        </Flex>
      ) : (
        <Box>
          <Table variant="striped" colorScheme="teal" size="sm">
            <Thead>
              <Tr>
                <Th>ID</Th>
                <Th>Usuario</Th>
                <Th>Nombre</Th>
                <Th>Puesto</Th>
                <Th>Legajo</Th>
                <Th>Teléfono</Th>
                <Th>Email</Th>
                <Th>Fecha de Creación</Th>
                <Th>Rol</Th>
                <Th>Ultimo Acceso</Th>
                <Th>Acciones</Th>
              </Tr>
            </Thead>
            <Tbody>
              {usuarios.map((usuario) => (
                
                <Tr
                key={usuario.usuario_id}
                _hover={{ bg: "gray.100", cursor: "pointer" }} // Resaltar al pasar el mouse
                onClick={() => abrirModalEdicion(usuario)} // Abrir el modal al hacer clic
              >
                <Td>{usuario.usuario_id}</Td>
                <Td>{usuario.usuario}</Td>
                <Td>{usuario.nombre_apellido}</Td>
                <Td>{usuario.puesto}</Td>
                <Td>{usuario.legajo}</Td>
                <Td>{usuario.telefono}</Td>
                <Td>{usuario.mail}</Td>
                <Td>{new Date(usuario.fecha_alta).toLocaleString()}</Td>
                <Td>{usuario.rol}</Td>
                <Td>
                  {usuario.ultimo_acceso
                    ? new Date(usuario.ultimo_acceso).toLocaleString()
                    : "No disponible"}
                </Td>
                <Td>
                {/* Botón de eliminar */}
                    <EliminarUsuarioConConfirmacion 
                  usuario_id={usuario.usuario_id} // Pasar el ID del usuario
                  fetchUsuarios={fetchUsuarios} // Pasar la función para refrescar usuarios
                />
              </Td>

              </Tr>
                
              ))}
            </Tbody>
          </Table>

          <Flex justifyContent="center" mt={5}>
            <Stack direction="row" spacing={4}>
              <Button
                onClick={() => {
                  if (currentPage > 1) fetchUsuarios(currentPage - 1);
                }}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <Text>
                Página {currentPage} de {totalPages}
              </Text>
              <Button
                onClick={() => {
                  if (currentPage < totalPages) fetchUsuarios(currentPage + 1);
                }}
                disabled={currentPage === totalPages}
              >
                Siguiente
              </Button>
            </Stack>
          </Flex>
        </Box>
      )}

      {/* Modal para agregar usuario */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Agregar Nuevo Usuario</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4} isInvalid={!!errorMessages.usuario}>
              <FormLabel fontSize="sm">Usuario</FormLabel>
              <Input
                name="usuario"
                value={nuevoUsuario.usuario}
                onChange={handleNuevoUsuarioChange}
              />
              {errorMessages.usuario && (
                <Text color="red.500">{errorMessages.usuario}</Text>
              )}
            </FormControl>

            <FormControl mb={4} isInvalid={!!errorMessages.nombre_apellido}>
              <FormLabel fontSize="sm">Nombre y Apellido</FormLabel>
              <Input
                name="nombre_apellido"
                value={nuevoUsuario.nombre_apellido}
                onChange={handleNuevoUsuarioChange}
              />
              {errorMessages.nombre_apellido && (
                <Text color="red.500">{errorMessages.nombre_apellido}</Text>
              )}
            </FormControl>

            <FormControl mb={4} isInvalid={!!errorMessages.nombre_apellido}>
              <FormLabel fontSize="sm">Legajo</FormLabel>
              <Input
                name="legajo"
                value={nuevoUsuario.legajo}
                onChange={handleNuevoUsuarioChange}
              />
              {errorMessages.legajo && (
                <Text color="red.500">{errorMessages.legajo}</Text>
              )}
            </FormControl>


            <FormControl mb={4} isInvalid={!!errorMessages.nombre_apellido}>
              <FormLabel fontSize="sm">Telefono</FormLabel>
              <Input
                name="telefono"
                value={nuevoUsuario.telefono}
                onChange={handleNuevoUsuarioChange}
              />
              {errorMessages.telefono && (
                <Text color="red.500">{errorMessages.telefono}</Text>
              )}
            </FormControl>

            <FormControl mb={4} isInvalid={!!errorMessages.mail}>
              <FormLabel fontSize="sm">Email</FormLabel>
              <Input
                name="mail"
                type="email"
                value={nuevoUsuario.mail}
                onChange={handleNuevoUsuarioChange}
              />
              {errorMessages.mail && (
                <Text color="red.500">{errorMessages.mail}</Text>
              )}
            </FormControl>

            <FormControl mb={4} isInvalid={!!errorMessages.rol_id}>
              <FormLabel fontSize="sm">Rol</FormLabel>
              <Select
                name="rol_id"
                value={nuevoUsuario.rol_id}
                onChange={handleNuevoUsuarioChange}
              >
                <option value="">Selecciona un rol</option>
                {roles.map((rol) => (
                  <option key={rol.rol_id} value={rol.rol_id}>
                    {rol.rol}
                  </option>
                ))}
              </Select>
              {errorMessages.rol_id && (
                <Text color="red.500">{errorMessages.rol_id}</Text>
              )}
            </FormControl>

            <FormControl mb={4} isInvalid={!!errorMessages.puesto_id}>
              <FormLabel fontSize="sm">Puesto</FormLabel>
              <Select
                name="puesto_id"
                value={nuevoUsuario.puesto_id}
                onChange={handleNuevoUsuarioChange}
              >
                <option value="">Selecciona un puesto</option>
                {puestos.map((puesto) => (
                  <option key={puesto.puesto_id} value={puesto.puesto_id}>
                    {puesto.puesto}
                  </option>
                ))}
              </Select>
              {errorMessages.puesto_id && (
                <Text color="red.500">{errorMessages.puesto_id}</Text>
              )}
            </FormControl>

            <FormControl mb={4} isInvalid={!!errorMessages.pwd}>
              <FormLabel>Contraseña</FormLabel>
              <Input
                type="password"
                name="pwd"
                value={usuarioSeleccionado.pwd}
                onChange={(e) => handleNuevoUsuarioChange(e)}
                width="300px" // Puedes ajustar el ancho aquí
                maxWidth="100%" // Esto asegura que no se exceda el contenedor
              />
              {errorMessages.pwd && (
                <Text color="red.500">{errorMessages.pwd}</Text>
              )}
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" onClick={crearUsuario}>
              Crear Usuario
            </Button>
            <Button onClick={onClose} ml={3}>
              Cancelar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

    <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
    <ModalOverlay />
    <ModalContent 
    width="800px" // Ancho del modal
    maxWidth="90%" // Máximo ancho que puede ocupar
    minHeight="200px" // Altura mínima
    maxHeight="120vh" // Altura máxima como porcentaje del viewport
  >
        <ModalHeader fontSize="lg">Editar Usuario</ModalHeader>
        <ModalBody fontSize="sm">
        <FormControl mb={4}>
            <FormLabel fontSize="sm">Usuario</FormLabel>
            <Input
            name="usuario"
            value={usuarioSeleccionado?.usuario || ""}
            onChange={(e) => setUsuarioSeleccionado({ ...usuarioSeleccionado, usuario: e.target.value })}
            />
        </FormControl>

        <FormControl mb={4}>
            <FormLabel fontSize="sm">Nombre y Apellido</FormLabel>
            <Input
            name="nombre_apellido"
            value={usuarioSeleccionado?.nombre_apellido || ""}
            onChange={(e) => setUsuarioSeleccionado({ ...usuarioSeleccionado, nombre_apellido: e.target.value })}
            />
        </FormControl>

        <FormControl mb={4}>
            <FormLabel fontSize="sm">Legajo</FormLabel>
            <Input
            name="lejajo"
            value={usuarioSeleccionado?.legajo     || ""}
            onChange={(e) => setUsuarioSeleccionado({ ...usuarioSeleccionado, legajo: e.target.value })}
            />
        </FormControl>

        <FormControl mb={4}>
            <FormLabel fontSize="sm">Teléfono</FormLabel>
            <Input
            name="telefono"
            value={usuarioSeleccionado?.telefono     || ""}
            onChange={(e) => setUsuarioSeleccionado({ ...usuarioSeleccionado, telefono: e.target.value })}
            />
        </FormControl>

        <FormControl mb={4}>
            <FormLabel fontSize="sm">Mail</FormLabel>
            <Input
            name="mail"
            value={usuarioSeleccionado?.mail     || ""}
            onChange={(e) => setUsuarioSeleccionado({ ...usuarioSeleccionado, mail: e.target.value })}
            />
        </FormControl>

        <FormControl isInvalid={!!errorMessages.puesto_id}>
        <FormLabel fontSize="sm">Puesto</FormLabel>
        <Select
          value={nuevoUsuario.puesto_id}
          onChange={(e) => {
            const value = e.target.value;
            setNuevoUsuario({
              ...nuevoUsuario,
              puesto_id: value ? parseInt(value, 10) : 0 // Convierte a número o establece a 0 si está vacío
            });
          }}
        >
          <option value="">Selecciona un puesto</option>
          {puestos.map((puesto) => (
            <option key={puesto.puesto_id} value={puesto.puesto_id}> {/* Usa el ID correcto */}
              {puesto.puesto}  {/* Asegúrate de que este campo existe en tu objeto puesto */}
            </option>
          ))}
        </Select>
        {errorMessages.puesto_id && <Text color="red.500">{errorMessages.puesto_id}</Text>}
      </FormControl>

        <FormControl isInvalid={!!errorMessages.rol_id}>
          <FormLabel fontSize="sm">Rol</FormLabel>
          <Select
            value={nuevoUsuario.rol_id}
            onChange={(e) => {
              const value = e.target.value;
              setNuevoUsuario({
                ...nuevoUsuario,
                rol_id: value ? parseInt(value, 10) : 0 // Convierte a número o establece a 0 si está vacío
              });
            }}
          >
            <option value="">Selecciona un rol</option>
            {roles.map((rol) => (
              <option key={rol.rol_id} value={rol.rol_id}> {/* Usa el ID correcto */}
                {rol.rol}
              </option>
            ))}
          </Select>
          {errorMessages.rol_id && <Text color="red.500">{errorMessages.rol_id}</Text>}
        </FormControl>
    

        <FormControl mb={4}>
            <FormLabel fontSize="sm">Contraseña</FormLabel>
            <Input
            type="password"
            name="pwd"
            value={usuarioSeleccionado?.pwd || ""}
            onChange={(e) => setUsuarioSeleccionado({ ...usuarioSeleccionado, pwd: e.target.value })}
            width="300px" // Puedes ajustar el ancho aquí
            maxWidth="100%"
            />
        </FormControl>
      </ModalBody>
    <ModalFooter fontSize="sm">
      <Button colorScheme="blue" onClick={() => guardarCambios(usuarioSeleccionado)}>
        Guardar Cambios
      </Button>
      <Button onClick={() => setIsEditModalOpen(false)} ml={3}>
        Cancelar
      </Button>
    </ModalFooter>
  </ModalContent>
</Modal>


    </Box>
  );
}
