<script>
export default {
  name: 'NoteView',
  data() {
    return{
      article: {
        title: '心中有梦，才能走得更远 - 如何正视高中生活？',
        content: '高中三年，短暂但又美好。\n' +
          '\n' +
          '有些人可能对我这句话表示反对，觉得高中过得一点也不开心，累死了，每天都生活在忙碌之中，与试卷同行，与作业为伍，早出晚归。但是，当你高中毕业后，相信你一定会对这段时光感到留恋。想到当初一起结伴同行的同伴，一起努力奋斗的同学，一切都仿佛历历在目，却再也回不去了，大家将会很少再见面了。\n' +
          '\n' +
          '时光真的很短暂，请珍惜当下的时光，热爱当下。不要虚度光阴，好好学习，为了理想而奋斗。也不要辜负了家长的期望，当然，也不要有压力，努力过就好，结局并不重要。\n' +
          '\n' +
          '我有问过一些同学，问问他们对将来有没有什么打算，大部分人的回复都是：摆烂，随波逐流。那为什么会造成这种现象呢？大部分因为的是：成绩不太理想，没有学习的动力，没有理想，没有目标。\n' +
          '\n' +
          '当一个人心中有着自己的理想，那他的学习会更加的有动力。目标会驱使他向目标不断靠近。所以，我建议大家尽早的定下自己的目标，为了目标努力前行。\n' +
          '\n' +
          '当然，目标不仅仅是一个分数，也不仅仅是一个学校。因为你要明白一个道理：怎么样读大学比读什么大学更重要。不要在大学生活中摆烂，大学生涯不仅仅只是为了个文凭。（具体看后文中的误区二）\n' +
          '\n' +
          '所以说，应该先找到自己喜欢的专业，再根据专业和当前的成绩去选择喜欢的院校作为自己的目标。因为专业的选择，决定了你大学愿不愿意好好学。如果你选的专业，你并不感兴趣，那大学是肯定学不好的。\n' +
          '\n' +
          '选专业的话，推荐一本书，《这才是我要的专业》，里面讲了各个专业的区别，可以帮助大家更好的选择自己喜欢的专业。\n' +
          '\n' +
          '其次就是选择院校了。首先，先根据地区和批次等因素筛选一下。（地区方面可以看一下《这才是我要的专业》书中附赠的《学长学姐说大学》，里面讲了一些主流城市读大学的体验，包括美食、气候、环境等多种介绍）然后筛选出来的结果，再根据招生人数、往年分数线、开设的专业类型、校园环境等进一步的选择，最后选出几所自己喜欢的就好啦。（高考志愿每个批次可以填报4~6个平行志愿，每个院校可以填报六个专业）最后，在知乎搜索一下这些学校，了解一下你想选择的专业在哪个校区。再查一下那个校区的环境，看看是否真的喜欢。（有些院校的不同校区真的是天差地别）\n' +
          '\n' +
          '最后，暑假开始努力吧。为了自己的理想开始奋斗，制定好学习计划，每天都坚持下去，相信成绩会有所提升的。\n' +
          '\n' +
          '\n' +
          '接下来讲几个大家常见的误区。\n' +
          '误区一：\n' +
          '在高一考虑这些是不是太早了？其实并不是的，高考出成绩后，《报考指南》发给各位高三学生。大约只有十五天的时间可以给你选择专业，选择大学。就那十五天时间，你能了解全部的专业吗？你能选择适合你的专业吗？（你知道“园林”和“园艺”这两个专业的区别吗？）你能想清楚到底报哪所学校吗？不会最后找个软件，输个成绩，然后点一下“智能填报”吧？这种做法不可取的，选择专业和院校不能只看成绩，最关键的是兴趣。在高中任何阶段关注专业与院校都不算早的，三年并不长，转眼间就过去了。\n' +
          '\n' +
          '误区二：\n' +
          '大学混一混不就过去了吗？好好学干嘛，又不是拿不到毕业证书。第一，当你多门课都挂科，补考也没合格的话，是拿不到毕业证书的。还有如果学分没有修够得话，也是一样的。第二，到了大学，主要是为了学一门技术，而不是混个毕业证书。学历不能代表一切，没有技术，只有学历，公司也是不会要你的。同理，有技术，学历稍微差一点，也是能找到好的工作的。（这里涉及到了误区三）\n' +
          '\n' +
          '误区三：\n' +
          '大专一定比本科差，学历决定一切。这并不一定的，当你的成绩在二本线边缘时，你上个大专其实也许会比上个二本更好些。全国前几的大专教育资源比一些普通二本院校都更好一些，也有些人在大专学的很好，找到了好的工作，每学期都领奖学金。学历并不能代表一切，重要的不是学历，而是你对那个专业喜不喜欢，愿不愿意学。大学创办的目的就是为了发展学生特长，走上每个人适合的工作岗位。如果只是为了上个本科，混个文凭，是没有意义的。当你够优秀的时候，文凭已经不重要了。你的才华会证明一些，你的技术会让你出众。学校是和企业有合作的，你学得好的话毕业后直接给你分配好的工作，不会毕业即失业的。\n' +
          '\n' +
          '再讲几个同学们比较容易受到困扰的问题。\n' +
          '问题一：\n' +
          '父母不让自己去外地上大学怎么办？建议和父母好好沟通，讲清楚原因，并解决他们所担忧的方面，相信他们会理解你的想法的。并不建议到时候直接偷偷填报志愿直接走。当你尊重父母的想法时，父母才会尊重你，这样只会激化矛盾，不可取。\n' +
          '\n' +
          '问题二：\n' +
          '没有考上理想的大学怎么办？其实这没什么大不了的，在接下来的生活中，好好学习就好了，就如同上文所说：怎么样读大学比读什么大学更重要。只要努力了，结局不会太差的。不管在什么学校，相信大学的那几年，都会成为你生命最美好的一段时光。\n' +
          '\n' +
          '问题三：\n' +
          '大学要不要当班干？怎么样当上班干？我建议试试看，如果不能胜任此份工作或不想当了，再退出就可以。有些事只有尝试过了，才知道值不值得。而且也可以锻炼锻炼自己，对以后的就业也有帮助，还可以白嫖一些学分。一般大学班干部的职位有：班长、副班长、团支书、文体委员、组织委员、宣传委员、生活委员、心理委员。想要当上班干的话，这个军训占比较大的因素，主要就是混个脸熟，当上军训时的联络员，比较容易能当上。\n' +
          '\n' +
          '写此文的目的，主要是为了帮助大家正视高中生活。对生活有着对的态度，不断努力的前进，不要虚度光阴。暂时就聊这么多吧，还有什么不懂得可以直接问我，看到了就会回，希望能帮助到大家。\n' +
          '\n' +
          '全文完。',
        date: '2022年06月25日星期六',
        author: 'lemon',
        views: '100',
        comments: '50',
        likes: '100'
      },
      scrollPercentage: 0,
    }
  },
  methods: {
    handleScroll(distance) {
      const scrollHeight =this.$refs["el-scrollbar"].wrapRef.scrollHeight - this.$refs["el-scrollbar"].wrapRef.offsetHeight;
      this.scrollPercentage = Math.round((distance.scrollTop / scrollHeight) * 100);
    },
  },
}
</script>

<template>
  <el-scrollbar @scroll="handleScroll" ref="el-scrollbar">
  <div class="h-full w-full flex flex-col items-center justify-start">
    <div class="w-full min-h-[40vh] bg-[url('/static/background/18.jpg')] flex flex-col justify-center items-center bg-center bg-cover">
      <p class="text-[#FFFFFF] font-['FZSX'] text-[4vh] hover:text-[#44cef6] duration-700">
        {{ article.title }}
      </p>
      <div class="flex flex-row items-center mb-[5px]">
        <div class="text-[2vh] text-[#FFFFFF] font-['SYST'] mr-[20px]">{{ article.author }}</div>
        <svg class="opacity-50 w-[2vh] h-[2vh] mr-[3px]" viewBox="0 0 24 24">
          <path fill="currentColor" d="M12 20a8 8 0 0 0 8-8a8 8 0 0 0-8-8a8 8 0 0 0-8 8a8 8 0 0 0 8 8m0-18a10 10 0 0 1 10 10a10 10 0 0 1-10 10C6.47 22 2 17.5 2 12A10 10 0 0 1 12 2m.5 5v5.25l4.5 2.67l-.75 1.23L11 13V7h1.5Z"></path>
        </svg>
        <div class="text-[2vh] text-[#FFFFFF] font-['SYST'] mr-[20px] opacity-50">{{ article.date }}</div>
        <img class="opacity-50 w-[2vh] h-[2vh] mr-[3px]" src="/static/svg/views.svg"  alt="浏览"/>
        <div class="text-[2vh] text-[#FFFFFF] font-['SYST'] mr-[20px] opacity-50">{{ article.views }}</div>
        <img class="opacity-50 w-[2vh] h-[2vh] mr-[3px]" src="/static/svg/likes.svg"  alt="喜欢"/>
        <div class="text-[2vh] text-[#FFFFFF] font-['SYST'] mr-[20px] opacity-50">{{ article.likes }}</div>
        <img class="opacity-50 w-[2vh] h-[2vh] mr-[3px]" src="/static/svg/comments.svg"  alt="评论"/>
        <div class="text-[2vh] text-[#FFFFFF] font-['SYST'] opacity-50">{{ article.comments }}</div>
      </div>
    </div>
    <div class="w-full flex flex-row items-start justify-center bg-[#F8FAFD]">
      <div class="w-[15%] flex flex-col items-center justify-start"></div>
      <div class="w-[70%] flex flex-col items-center justify-start">
        <div class="w-full bg-[#FFFFFF] shadow-md mt-[20px] text-[2vh] font-['SYST'] p-[40px]">
        {{ article.content }}
        </div>
      </div>
      <div class="w-[15%] flex flex-col items-start justify-start p-[40px] sticky top-[40px]">
        <div class="h-[30px]">这是一个二级标题展示区域</div>
        <div class="h-[30px]">二级标题1</div>
        <div class="h-[30px]">二级标题2</div>
        <div class="h-[30px]">二级标题3</div>
        <el-divider />
        <div class="flex flex-row items-center justify-start">
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
          <path fill="currentColor" d="M12 22q-2.05 0-3.875-.788t-3.187-2.15q-1.363-1.362-2.15-3.187T2 12q0-2.075.788-3.887t2.15-3.175Q6.3 3.575 8.124 2.788T12 2q.425 0 .713.288T13 3q0 .425-.288.713T12 4Q8.675 4 6.337 6.338T4 12q0 3.325 2.338 5.663T12 20q3.325 0 5.663-2.337T20 12q0-.425.288-.712T21 11q.425 0 .713.288T22 12q0 2.05-.788 3.875t-2.15 3.188q-1.362 1.362-3.175 2.15T12 22"></path>
        </svg>
        <div class="m-[3px]">{{ scrollPercentage }}%</div>
        </div>
      </div>
    </div>
  </div>
  </el-scrollbar>
</template>

<style scoped>

</style>