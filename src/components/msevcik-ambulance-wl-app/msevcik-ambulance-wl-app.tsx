import { Component, Host, h, Prop } from '@stencil/core';
import { createRouter, Route, match } from 'stencil-router-v2';

@Component({
  tag: 'msevcik-ambulance-wl-app',
  styleUrl: 'msevcik-ambulance-wl-app.css',
  shadow: true,
})
export class MsevcikAmbulanceWlApp {

  @Prop({ attribute: "base-path" }) basePath: string = "";

  @Prop() ambulance: string = "";

  @Prop({ attribute: "api-uri" })
  apiUri: string = "";

  static Router;

  connectedCallback() { 
    MsevcikAmbulanceWlApp.Router = MsevcikAmbulanceWlApp.Router || createRouter();
  }

  // rebases path relative to base-path property
  rebase(path): string {
    if(this.basePath.endsWith("/")) {
      this.basePath = this.basePath.substring(0, this.basePath.length-1);
    }
    return this.basePath + path;
  }

  handleEntrySelection(e: CustomEvent) {
    MsevcikAmbulanceWlApp.Router.push(this.rebase(`/entry/${e.detail}`));
  }

  handleNewEntry(){ MsevcikAmbulanceWlApp.Router.push(this.rebase(`/entry/@new`));}

  handleEditorClosed() {window.history.back();}

  render() {
    console.debug("msevcik-ambulance-wl-app.render() - path: %s", MsevcikAmbulanceWlApp.Router.activePath);
    return (
      <Host>
        <MsevcikAmbulanceWlApp.Router.Switch>
          <Route path={match(this.rebase("/entry/:id"))}
                 render={(params) => (
                   <msevcik-ambulance-wl-editor 
                     entry-id={params.id}
                     api-uri={this.apiUri}
                     ambulance={this.ambulance}
                     onWlChange={this.handleEditorClosed.bind(this)}
                     onDeleted={this.handleEditorClosed.bind(this)}
                     onCanceled={this.handleEditorClosed.bind(this)}></msevcik-ambulance-wl-editor>
                 )} />
          <Route  path={this.rebase("/")}>
               <msevcik-ambulance-wl-list 
                ambulance={this.ambulance}
                api-uri={this.apiUri} 
                onWlEntrySelected={this.handleEntrySelection.bind(this)}></msevcik-ambulance-wl-list>
               <mwc-fab id="add-entry" icon="add" // << new element to create a new entry
                        onCLick={this.handleNewEntry.bind(this)}></mwc-fab>     
          </Route>
          <Route
            path={this.rebase("")} to={this.rebase("/")}>
          </Route>
        </MsevcikAmbulanceWlApp.Router.Switch>
      </Host>
    );
  }
}
