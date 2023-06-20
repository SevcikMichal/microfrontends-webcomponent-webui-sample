import { newSpecPage } from '@stencil/core/testing';
import { MsevcikAmbulanceWlEditor } from '../msevcik-ambulance-wl-editor';
import axios from 'axios';
import MockAdapter from "axios-mock-adapter";
import { Condition } from '../../../api';

describe('msevcik-ambulance-wl-editor', () => {
  let mock;

  beforeAll(() => { 
    mock = new MockAdapter(axios); 
    const conditions: Condition[] = [
      {
          code: "folowup",
          value: "Kontrola",
          typicalDurationMinutes: 15
      },
      {
          code: "nausea",
          value: "Nevoľnosť",
          typicalDurationMinutes: 45,
          reference: "https://zdravoteka.sk/priznaky/nevolnost/"
      }
    ];
    const entries = [
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
      }];
    mock.onGet(`/api/waiting-list/bobulova/entries`).reply(200, entries);
    mock.onGet(`/api/waiting-list/bobulova/condition`).reply(200, conditions);
  });

  afterEach(() => { mock.reset(); }); 

  it('display only cancel on new item', async () => {
    const page = await newSpecPage({
      components: [MsevcikAmbulanceWlEditor],
      html: `<msevcik-ambulance-wl-editor 
                entry-id="@new" 
                api-uri="/api"
                ambulance="bobulova"
              ></msevcik-ambulance-wl-editor>`,
    });
    const items = await page.root.shadowRoot.querySelectorAll("mwc-button");
    var disabled = 0;
    items.forEach(_ => { if(_.getAttribute("disabled")!==null) ++disabled; });
    expect(disabled).toEqual(2)
  });
});
