import type { Program } from './findFreedom.types';

export const FIND_FREEDOM_PROGRAMS: Program[] = [
  {
    number: '01',
    title: 'Pre-Encounter',
    subtitle: 'Prepare Your Heart for a Life-Changing Encounter',
    description:
      'Every life-changing experience begins with preparation. Pre-Encounter is designed to help you understand what God is about to do in your life while preparing your heart for one of the most significant moments in your spiritual journey. Come expectant, ready to leave distractions behind and experience God in a deeper, more personal way.',
    closingLine: 'God prepares the hearts He is about to transform.',
    cta: 'Reserve My Spot',
    duration: 'Day 1',
    tag: 'Foundation',
    previewLabel: 'Session 01 • Heart Preparation',
  },
  {
    number: '02',
    title: 'The Encounter',
    subtitle: 'Experience God Like Never Before',
    description:
      "The Encounter is an opportunity to step away from the noise of everyday life and spend intentional time in God's presence. Through powerful sessions, heartfelt worship, and authentic community, you'll experience His love, find freedom, and deepen your relationship with Christ in a way that can shape the course of your life.",
    closingLine: 'Sometimes all it takes is one encounter with God to change everything.',
    cta: 'Register for Encounter',
    duration: 'Day 2',
    tag: 'Experience',
    previewLabel: 'Session 02 • Worship & Encounter',
  },
  {
    number: '03',
    title: 'Post-Encounter',
    subtitle: 'Keep Growing. Keep Moving Forward.',
    description:
      'Your Encounter is not the finish line. It\'s the beginning of a new season with God. Post-Encounter helps you build on what God has started by strengthening your faith, connecting you with a spiritual family, and taking your next steps through water baptism and ongoing discipleship. Because lasting transformation happens when we continue walking with Christ together.',
    closingLine: 'The best is not behind you. It\'s just beginning.',
    cta: 'Take My Next Step',
    duration: 'Day 3',
    tag: 'Water Baptism',
    previewLabel: 'Session 03 • Discipleship & Baptism',
  },
];

export const INITIAL_FORM_STATE = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  inspiration: '',
  hearAboutUs: '',
};
