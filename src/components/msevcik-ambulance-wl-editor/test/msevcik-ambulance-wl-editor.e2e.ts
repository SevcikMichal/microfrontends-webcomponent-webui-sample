import { newE2EPage } from '@stencil/core/testing';
import { Condition } from '../../../api';

describe('msevcik-ambulance-wl-editor', () => {

  const conditions: Condition[] = [{
        code: "folowup",
        value: "Kontrola",
        typicalDurationMinutes: 15
    }, {
        code: "nausea",
        value: "Nevoľnosť",
        typicalDurationMinutes: 45,
        reference: "https://zdravoteka.sk/priznaky/nevolnost/"
    }];

  const entries = [{   
    id:  "bi101",
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

  it('renders', async () => {
    const page = await newE2EPage();
    await page.setRequestInterception(true);

    page.on('response', response => { 
      if (response.url() === 'http://localhost:3333/') { // HACK: https://github.com/   ionic-team/stencil/issues/2434#issuecomment-714776773
        (page as any).removeAllListeners('request');

        page.on('request', interceptedRequest => {
          const url = interceptedRequest.url();
          const base = '/api/waiting-list/bobulova';
          if (url.endsWith(`${base}/condition`))  {
            interceptedRequest.respond({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify(conditions)
            });
          } else if(url.endsWith(`${base}/entries`)) {
            interceptedRequest.respond({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify(entries)
            });
          } else interceptedRequest.continue();
      });
    }});

    await page.setContent(
       `<msevcik-ambulance-wl-editor 
          entry-id="@new" 
          api-uri="/api"
          ambulance="bobulova"
        ></msevcik-ambulance-wl-editor>`);

    const element = await page.find('msevcik-ambulance-wl-editor');
    expect(element).toHaveClass('hydrated');
  });
});
