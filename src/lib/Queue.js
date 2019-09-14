import Bee from 'bee-queue';
import jobs from '../app/jobs/index';
import redisConfig from '../config/redis';

class Queue {
  constructor() {
    this.queues = {};
    this.init();
  }

  init() {
    jobs.forEach(({ key, handle }) => {
      this.queues[key] = {
        bee: new Bee(key, { redis: redisConfig }),
        handle,
      };
    });
  }

  add(queue, job) {
    return this.queues[queue].bee.createJob(job).save();
  }

  handleFailure(job, err) {
    console.log(`Job failed, ${job.queue.name}, err: ${err}`);
  }

  processQueue() {
    jobs.forEach(job => {
      const { bee, handle } = this.queues[job.key];
      bee.on('failure', this.handleFailure).process(handle);
    });
  }
}
export default new Queue();
