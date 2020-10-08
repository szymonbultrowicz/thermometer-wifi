#ifndef __READINGERROR_H__
#define __READINGERROR_H__

struct ReadingError {
    const char* error;
    int connectionTime = -1;
    int readTime = -1;
    int battery = 0;
};

#endif