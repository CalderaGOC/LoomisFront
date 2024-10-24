'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Button,
  Flex,
  Text,
  Input,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';

interface Planilla {
  planilla_id: number;
  planilla: string;
  fecha_planilla: string;
  usuario: string;
}

interface PlanillasPageProps {
  usuario_id: number;  // Suponemos que pasas el usuario_id como prop
}

const PlanillasPage = ({ usuario_id }: PlanillasPageProps) => {
  const [planillas, setPlanillas] = useState<Planilla[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [criterio, setCriterio] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure(); // Para manejar el modal
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // Estado para almacenar el archivo seleccionado
  const [descripcion, setDescripcion] = useState('');  // Estado para almacenar la descripción

  const limit = 10;

  const fetchPlanillas = async (page: number) => {
    setLoading(true);
    setIsSearching(false);
    try {
      const response = await fetch(`http://localhost:3002/planillas/listar?page=${page}&limit=${limit}`);
      if (!response.ok) {
        throw new Error('Error al obtener las planillas');
      }
      const data = await response.json();
      setPlanillas(data.planillas);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchPlanillas = async (criterio: string) => {
    setLoading(true);
    setIsSearching(true);
    try {
      const response = await fetch(`http://localhost:3002/planillas/buscar/${criterio}`);
      if (!response.ok) {
        throw new Error('Error al buscar las planillas');
      }
      const data = await response.json();
      setPlanillas(data.planillas);
      setTotalPages(1);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isSearching) {
      fetchPlanillas(page);
    }
  }, [page]);

  const handlePreviousPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    setSelectedFile(file);
  };

  // Función para enviar el archivo, la descripción y el usuario_id al backend
  const handleImport = async () => {
    if (!selectedFile || !descripcion) return;

    const formData = new FormData();
    formData.append('file', selectedFile);         // Enviamos el archivo
    formData.append('descripcion', descripcion);   // Enviamos la descripción
    formData.append('usuario_id', '111'); // Enviamos el usuario_id HARDCODEADO AHORA

    try {
      const response = await fetch('http://localhost:3002/planillas/importar', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Error al importar la planilla');
      }
      const data = await response.json();
      console.log('Importación exitosa:', data);
      // Aquí puedes manejar la respuesta, como mostrar una notificación de éxito o refrescar la lista de planillas
    } catch (error) {
      console.error('Error:', error);
    } finally {
      onClose(); // Cerrar el modal después de importar
    }
  };

  const bgColor = useColorModeValue('gray.100', 'gray.700');

  return (
    <Box p={5}>
      <Flex justify="space-between" mb={4}>
        <Button onClick={onOpen} colorScheme="green">
          Importar
        </Button>
        <Text fontSize="2xl" textAlign="center">
          Lista de Planillas
        </Text>
      </Flex>

      {/* Input y botón para búsqueda */}
      <Flex mb={4} justify="center">
        <Input
          placeholder="Buscar planillas"
          value={criterio}
          onChange={(e) => setCriterio(e.target.value)}
          width="300px"
          mr={2}
        />
        <Button onClick={() => searchPlanillas(criterio)} colorScheme="blue">
          Buscar
        </Button>
      </Flex>

      {loading ? (
        <Flex justify="center" align="center" height="100%">
          <Spinner size="xl" />
        </Flex>
      ) : (
        <Box bg={bgColor} p={4} rounded="md" shadow="md">
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>ID</Th>
                <Th>Planilla</Th>
                <Th>Fecha</Th>
                <Th>Usuario</Th>
              </Tr>
            </Thead>
            <Tbody>
              {planillas.map((planilla) => (
                <Tr key={planilla.planilla_id}>
                  <Td>{planilla.planilla_id}</Td>
                  <Td>{planilla.planilla}</Td>
                  <Td>{new Date(planilla.fecha_planilla).toLocaleDateString()}</Td>
                  <Td>{planilla.usuario}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>

          {!isSearching && (
            <Flex justify="space-between" align="center" mt={4}>
              <Button onClick={handlePreviousPage} disabled={page === 1}>
                Anterior
              </Button>
              <Text>
                Página {page} de {totalPages}
              </Text>
              <Button onClick={handleNextPage} disabled={page === totalPages}>
                Siguiente
              </Button>
            </Flex>
          )}
        </Box>
      )}

      {/* Modal para importar planilla */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Importar Planilla</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {/* Input para el archivo */}
            <FormControl mb={4}>
              <FormLabel>Seleccionar archivo Excel</FormLabel>
              <Input type="file" accept=".xlsx" onChange={handleFileChange} />
            </FormControl>

            {/* Input para la descripción */}
            <FormControl>
              <FormLabel>Descripción</FormLabel>
              <Input
                type="text"
                placeholder="Descripción de la planilla"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              />
            </FormControl>

            {/* Mostramos el usuario_id (si es necesario, o solo lo enviamos) */}
            <Text mt={4}>Usuario ID: {usuario_id}</Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleImport} isDisabled={!selectedFile || !descripcion}>
              Importar
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default PlanillasPage;
