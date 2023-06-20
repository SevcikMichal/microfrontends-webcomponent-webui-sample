import { newSpecPage } from '@stencil/core/testing';
import { MsevcikAmbulanceWlList } from '../msevcik-ambulance-wl-list';
import axios from 'axios';
import MockAdapter from "axios-mock-adapter";

describe('msevcik-ambulance-wl-list', () => {

  let mock;

  beforeAll(() => { 
    mock = new MockAdapter(axios); 
    const response = [
        {   id:  "bi101",
            name: 'Jožko Púčik',
            patientId: '10001',
            waitingSince: new Date(Date.now() - 10 * 60).toISOString(),
            estimatedStart: new Date(Date.now() + 65 * 60).toISOString(),
            estimatedDurationMinutes: 15,
            condition: {
                code: "folowup",
                value: "Kontrola",
                typicalDurationMinutes: 15
            }
        }, { id:  "bi102",
            name: 'Bc. August Cézar',
            patientId: '10096',
            waitingSince: new Date(Date.now() - 30 * 60).toISOString(),
            estimatedStart: new Date(Date.now() + 30 * 60).toISOString(),
            estimatedDurationMinutes: 20,
            condition: {
                code: "subfebrilia",
                value: "Teploty",
                typicalDurationMinutes: 20,
                reference: "https://zdravoteka.sk/priznaky/zvysena-telesna-teplota/"
            }
        }, { id:  "bi103",
            name: 'Ing. Ferdinand Trety',
            patientId: '10028',
            waitingSince: new Date(Date.now() - 72 * 60).toISOString(),
            estimatedStart: new Date(Date.now() + 5 * 60).toISOString(),
            estimatedDurationMinutes: 15,
            condition: {
                code: "ache-in-throat",
                value: "Bolesti hrdla",
                typicalDurationMinutes: 20,
                reference: "https://zdravoteka.sk/priznaky/bolest-pri-prehltani/"
            }
        }];
    mock.onGet(`/api/waiting-list/bobulova/entries`).reply(200, response);
  });

  afterEach(() => { mock.reset(); }); 

  it('renders', async () => {
    jest.mock('axios');    

    const page = await newSpecPage({
      components: [MsevcikAmbulanceWlList],
      html: `<msevcik-ambulance-wl-list api-uri="/api" ambulance="bobulova"></msevcik-ambulance-wl-list>`,
    });
    const items = await page.root.shadowRoot.querySelectorAll("mwc-list-item");
    expect(items.length).toEqual(3)
  });
});
