import React from 'react';
import Layout from '@theme/Layout';
import ProtectedContent from '@site/plugins/docusaurus-auth/theme/ProtectedContent';

const publicResources = [
  { curso: 'Git', modulo: 25, path: '/diapositivas/git/' },
  { curso: 'Spring Boot', modulo: 25, path: '/diapositivas/spring/' },
  { curso: 'Oracle', modulo: 21, path: '/diapositivas/oracle/' },
];

const dockerComposeFiles = [
  { name: 'Spring Boot', path: '/docker-compose/Spring-docker-compose.yml' },
  { name: 'Oracle', path: '/docker-compose/Oracle-docker-compose.yml' },
  { name: 'React', path: '/docker-compose/React-docker-compose.yml' },
];

const privateExams = [
  { name: 'Clean Code', path: '/examenes/cleancode-examen-final.toml' },
  { name: 'Diseño de APIs', path: '/examenes/diseno-apis-examen-final.toml' },
  { name: 'SOLID', path: '/examenes/solid-examen-final.toml' },
  { name: 'Patrones de Diseño', path: '/examenes/patrones-disenio-examen-final.toml' },
  { name: 'Arquitectura de Software', path: '/examenes/arquitectura-software-examen-final.toml' },
  { name: 'Git', path: '/examenes/git-examen-final.toml' },
  { name: 'Spring Boot', path: '/examenes/spring-examen-final.toml' },
  { name: 'React', path: '/examenes/react-examen-final.toml' },
  { name: 'Docker', path: '/examenes/docker-examen-final.toml' },
];

export default function Recursos() {
  return (
    <Layout title="Recursos" description="Recursos descargables de SASF Temarios">
      <main className="container margin-vert--lg">
        <h1>Recursos descargables</h1>

        <h2>Diapositivas (PPTX)</h2>
        <table>
          <thead>
            <tr>
              <th>Curso</th>
              <th>Módulos</th>
              <th>Descargar</th>
            </tr>
          </thead>
          <tbody>
            {publicResources.map(r => (
              <tr key={r.curso}>
                <td>{r.curso}</td>
                <td>{r.modulo} diapositivas</td>
                <td>
                  <a href={r.path} className="button button--sm button--secondary">
                    Ver PPTX
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2>Docker Compose</h2>
        <ul>
          {dockerComposeFiles.map(f => (
            <li key={f.name}>
              <a href={f.path} download>
                {f.name} — docker-compose.yml
              </a>
            </li>
          ))}
        </ul>

        <ProtectedContent>
          <h2>🔒 Exámenes finales (TOML)</h2>
          <table>
            <thead>
              <tr>
                <th>Curso</th>
                <th>Descargar</th>
              </tr>
            </thead>
            <tbody>
              {privateExams.map(exam => (
                <tr key={exam.name}>
                  <td>{exam.name}</td>
                  <td>
                    <a href={exam.path} download className="button button--sm button--primary">
                      Descargar TOML
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ProtectedContent>
      </main>
    </Layout>
  );
}
