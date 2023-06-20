import { newE2EPage } from '@stencil/core/testing';

describe('msevcik-ambulance-wl-app', () => {

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
          if(url.endsWith(`${base}/entries`)) {
            interceptedRequest.respond({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify(entries)
            });
          } else interceptedRequest.continue();
      });
    }});
    await page.setContent(`<msevcik-ambulance-wl-app 
      api-uri="/api" 
      ambulance="bobulova"
    ></msevcik-ambulance-wl-app>`);

    const element = await page.find('msevcik-ambulance-wl-app');
    expect(element).toHaveClass('hydrated');
  });
});
