// Public wording for each application status, shared by the compact status
// (route cells) and the full application panel.

import type { ApplicationStatus } from './state';
import type { Application } from './content';

export function applicationView(app: Application, status: ApplicationStatus) {
  const [Noun, noun] = app.key === 'student' ? ['Applications', 'Application'] : ['Proposals', 'Proposal'];
  switch (status) {
    case 'open':
      return {
        tag: 'Open',
        headline: `${Noun} are open`,
        detail: app.closesLabel ? `Due ${app.closesLabel}` : 'Deadline to be announced',
      };
    case 'opening-soon':
      return {
        tag: 'Opening soon',
        headline: app.opensLabel ? `Opens ${app.opensLabel}` : 'Opening soon',
        detail: app.opensLabel ? `Opens ${app.opensLabel}` : 'Opening date to be announced',
      };
    case 'closed':
      return { tag: 'Closed', headline: `${Noun} are closed`, detail: '' };
    default:
      // Sponsor pages already say what a proposal contains; what is still to come is how and when to submit.
      return { tag: 'Details forthcoming', headline: `${app.key === 'student' ? noun : 'Submission'} details forthcoming`, detail: '' };
  }
}
