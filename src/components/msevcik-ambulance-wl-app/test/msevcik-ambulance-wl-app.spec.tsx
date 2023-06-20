import { newSpecPage } from '@stencil/core/testing';
import { MsevcikAmbulanceWlApp } from '../msevcik-ambulance-wl-app';

describe('msevcik-ambulance-wl-app', () => {
  it('renders editor', async () => {
    MsevcikAmbulanceWlApp.Router = null;
    const page = await newSpecPage({
      url: `http://localhost/ambulance-wl/entry/@new`,
      components: [MsevcikAmbulanceWlApp],
      html: `<msevcik-ambulance-wl-app ambulance={this.ambulance}  base-path="/ambulance-wl"></msevcik-ambulance-wl-app>`,
    });
    const child = await page.root.shadowRoot.firstElementChild;
    expect(child.tagName.toLocaleLowerCase()).toEqual("msevcik-ambulance-wl-editor");

  });

  it('renders list', async () => {
    MsevcikAmbulanceWlApp.Router = null;
    const page = await newSpecPage({
      url: `http://localhost/ambulance-wl/`,
      components: [MsevcikAmbulanceWlApp],
      html: `<msevcik-ambulance-wl-app ambulance={this.ambulance}  base-path="/ambulance-wl"></msevcik-ambulance-wl-app>`,
    });
    const child = await page.root.shadowRoot.firstElementChild;
    expect(child.tagName.toLocaleLowerCase()).toEqual("msevcik-ambulance-wl-list");

  });
});
