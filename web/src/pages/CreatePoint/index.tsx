import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

import Dropzone from '../../components/Dropzone';
import MapView from '../../components/MapView';

import axios from 'axios';

import api from '../../services/api';

import './styles.css';

import logo from '../../assets/logo.svg';

interface Item {
  id: number;
  title: string;
  image_url: string;
}

interface Uf {
  sigla: string;
}

interface City {
  nome: string;
}

const CreatePoint = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
  });
  const [items, setItems] = useState<Item[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [ufs, setUfs] = useState<string[]>([]);

  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectedCity, setSelectedCity] = useState('0');
  const [selectedUf, setSelectedUf] = useState('0');
  

  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0]);
  const [selectedFile, setSelectedFile] = useState<File>();

  const history = useHistory();

  

  useEffect(() => {
    api.get('items').then(res => {
      setItems(res.data);
    })
  }, []);

  useEffect(() => {
    axios.get<Uf[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=sigla').then(res => {
      const ufInitials = res.data.map(uf => {
        return uf.sigla;
      });

      setUfs(ufInitials);
    });
  }, []);

  useEffect(() => {
    if(selectedUf === '0') return;

    axios.get<City[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`).then(res => {
      const cityName = res.data.map(city => {
        return city.nome;
      });

      setCities(cityName);
    });
    
  }, [selectedUf]);

  function handleSelectUf(e: ChangeEvent<HTMLSelectElement>) { //Alteração de um select
    setSelectedUf(e.target.value);
  }

  function handleSelectCity(e: ChangeEvent<HTMLSelectElement>) { //Alteração de um select
    setSelectedCity(e.target.value);
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    /* Mantém os dados que já tinha e troca o que está sendo digitado */
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  function handleSelectItem(id: number) {
    /* Procura se tem um item com esse ID, se não tiver retorna -1 */
    const alreadySelected = selectedItems.findIndex(item => item === id);

    if(alreadySelected >= 0) {
      /* Filtra os itens, removendo o que acabou de ser clicado */
      const filteredItems = selectedItems.filter(item => item !== id);
      setSelectedItems(filteredItems);
    } else {
      setSelectedItems([ ...selectedItems, id ]);
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const { name, email, whatsapp } = formData;
    const uf = selectedUf;
    const city = selectedCity;
    const [ latitude, longitude ] = selectedPosition; //Desestruturando array
    const items = selectedItems;

    const data = new FormData();

    data.append('name', name);
    data.append('email', email);
    data.append('whatsapp', whatsapp);
    data.append('uf', uf);
    data.append('city', city);
    data.append('latitude', String(latitude));
    data.append('longitude', String(longitude));
    data.append('items', items.join(','));
    
    if(selectedFile) {
      data.append('image', selectedFile);
    }
    

    await api.post('points', data);
    
    alert('Ponto de coleta criado');

    history.push('/');
  }

  return(
    <div id="page-create-point">
      <header>
          <img src={logo} alt="Ecoleta"/>

        <Link to="/">
          <FiArrowLeft />
          Voltar para home
        </Link>
      </header>

      <form onSubmit={handleSubmit}>
        <h1>Cadastro do ponto de coleta</h1>

        <Dropzone onFileUploaded={setSelectedFile} />

        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>

          <div className="field">
            <label htmlFor="name">Nome da entidade</label>
            <input
              type="text"
              name="name"
              id="name"
              onChange={handleInputChange}
            />
          </div>

          <div className="field-group">
            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input
                type="email"
                name="email"
                id="email"
                onChange={handleInputChange}
              />
            </div>

            <div className="field">
              <label htmlFor="whatsapp">Whatsapp</label>
              <input
                type="text"
                name="whatsapp"
                id="whatsapp"
                onChange={handleInputChange}
              />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o endereço no mapa</span>
          </legend>

          <MapView getLatLng={setSelectedPosition}/>
        
          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Estado</label>
              <select
                name="uf"
                id="uf"
                value={selectedUf}
                onChange={handleSelectUf}
                >
                <option value="0">Selecione um estado</option>
                {ufs.map(uf => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="city">Cidade</label>
              <select
                name="city"
                id="city"
                value={selectedCity}
                onChange={handleSelectCity}
              >
                <option value="0">Selecione uma cidade</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Itens de coleta</h2>
            <span>Selecione um ou mais itens abaixo</span>
          </legend>

          <ul className="items-grid">
            { items.map(item => (
              <li
                key={item.id}
                onClick={() => handleSelectItem(item.id)}
                className={selectedItems.includes(item.id) ? 'selected' : ''}
              >
                <img src={item.image_url} alt="Óleo"/>
                <span>{item.title}</span>
              </li>
            ))}         
          </ul>
        </fieldset>

        <button type="submit">Cadastrar ponto de coleta</button>
      </form>
    </div>
  );
}

export default CreatePoint;