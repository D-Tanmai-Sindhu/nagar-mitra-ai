import { CivicReport } from './types';

import issueImg1 from './assets/images/regenerated_image_1782604484763.png';
import issueImg2 from './assets/images/regenerated_image_1782604214051.png';


export const HYDERABAD_ZONES = [
  'Central Zone',
  'West Zone',
  'North Zone',
  'North-East Zone',
  'South Zone',
  'East Zone',
];


// Demo scenarios for evaluation/testing
// These simulate citizen reports after submission
export const INITIAL_REPORTS: CivicReport[] = [

  {
    id: 'HYD-DEMO-001',

    title: 'Large Garbage Dump Blocking Roadside',

    category: 'Garbage',

    aiSuggestedCategory: 'Garbage',

    confidence: 97,

    severity: 'High',

    reason:
      'AI detected a large accumulation of mixed waste near a public road creating hygiene risks and possible drainage blockage.',

    recommendedAction:
      'Sanitation team dispatch required for immediate waste clearance and area cleaning.',

    location:
      'Banjara Hills, Road No. 12, Hyderabad',

    zone:
      'West Zone',

    latitude: 17.4123,

    longitude: 78.4488,


    description:
      'Garbage accumulation observed near pedestrian area causing foul smell and public inconvenience.',


    imageUrl: issueImg1,


    status: 'Reported',


    createdAt:
      new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),


    updatedAt:
      new Date(Date.now() - 30 * 60 * 1000).toISOString(),


    verificationQuestion:
      'Is the garbage dump still present?',


    verifications: {

      stillPresent: 12,

      resolved: 1

    },


    department:
      'GHMC Sanitation Wing'

  },


  {


    id: 'HYD-DEMO-002',


    title:
      'Sewage Overflow From Manhole',


    category:
      'Sewage Overflow',


    aiSuggestedCategory:
      'Sewage Overflow',


    confidence:
      96,


    severity:
      'Critical',


    reason:
      'AI identified sewage water overflow from a road manhole causing possible contamination risk.',


    recommendedAction:
      'Immediate sewer cleaning and maintenance team dispatch recommended.',


    location:
      'Nizampet Main Road, Hyderabad',


    zone:
      'North Zone',


    latitude:
      17.5095,


    longitude:
      78.3999,


    description:
      'Sewage water is overflowing onto the road causing smell and traffic issues.',


    imageUrl:
      issueImg1,


    status:
      'Work In Progress',


    createdAt:
      new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),


    updatedAt:
      new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),


    verificationQuestion:
      'Is sewage still overflowing?',


    verifications: {

      stillPresent: 18,

      resolved: 2

    },


    department:
      'HMWSSB Sewerage Division'


  },


  {


    id:
      'HYD-DEMO-003',


    title:
      'Incorrect Civic Complaint Example',


    category:
      'Other',


    aiSuggestedCategory:
      'No Civic Issue Detected',


    confidence:
      92,


    severity:
      'Low',


    reason:
      'AI detected that the uploaded image does not represent a civic problem requiring action.',


    recommendedAction:
      'No action required. User should submit a valid civic issue image.',


    location:
      'Lumbini Park, Hyderabad',


    zone:
      'Central Zone',


    latitude:
      17.4126,


    longitude:
      78.4737,


    description:
      'Image shows normal public infrastructure/water feature. Not a civic complaint.',


    imageUrl:
      issueImg2,


    status:
      'Resolved',


    createdAt:
      new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),


    updatedAt:
      new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),


    verificationQuestion:
      'Was this complaint valid?',


    verifications: {

      stillPresent: 0,

      resolved: 15

    },


    communityResolutionVote:
      'Yes, Fully Fixed',


    department:
      'Citizen Validation Layer'

  }

];